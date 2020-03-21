import {
  Program,
  Node,
  Function,
  Definition,
  Identifier,
  BinaryExpression,
} from './ast';

type CompiledProgram = {
  functionSignatures: number[];
  functionDeclarations: number[];
  functionBodies: number[];
  exports: number[];
};

const TYPE_SECTION_ID = 0x1;
const FUNCTION_SECTION_ID = 0x3;
const EXPORT_SECTION_ID = 0x7;
const START_SECTION_ID = 0x8;
const CODE_SECTION_ID = 0xa;

const FUNC_TYPE = -0x20;
const I32_TYPE = -0x01;
const FUNC_BODY_END_TYPE = 0xb;

const I32_ADD_OPCODE = 0x6a;
const I32_SUBTRACT_OPCODE = 0x6b;
const I32_MULTIPLY_OPCODE = 0x6c;
const I32_DIVIDE_OPCODE = 0x6d; // i32.div_s for now

const FUNC_EXTERNAL_KIND = 0;

const bytePad = (bytes: number[], totalByteLength: number): number[] => [
  ...bytes,
  ...Array(totalByteLength - bytes.length).fill(0x0),
];

/* Leveraging String#charCodeAt(), which is UTF-16.
 * We might have to convert to UTF-8 in the future */
const stringToBytes = (string: string): number[] =>
  [...string].map(c => c.charCodeAt(0));

const magicNumber = [0x0, 0x61, 0x73, 0x6d];
const wasmVersion = bytePad([0x1], 4);

const createCompiledProgram = (): CompiledProgram => ({
  functionSignatures: [],
  functionDeclarations: [],
  functionBodies: [],
  exports: [],
});

const createFunctionSignature = ({ params }: Function): number[] => [
  FUNC_TYPE,
  params.length,
  ...Array(params.length).fill(I32_TYPE),
  1,
  I32_TYPE, // TODO: add return type to AST entry or grab from body
];

const createExport = (
  { identifier, value }: Definition,
  declarationIndex: number,
): number[] => [
  identifier.name.length,
  ...stringToBytes(identifier.name),
  FUNC_EXTERNAL_KIND, // only function exports are supported in the MVP
  declarationIndex,
];

const getOperatorCode = (operator: string): number => {
  switch (operator) {
    case '+':
      return I32_ADD_OPCODE;
    case '-':
      return I32_SUBTRACT_OPCODE;
    case '*':
      return I32_MULTIPLY_OPCODE;
    case '/':
      return I32_DIVIDE_OPCODE;
    default:
      return 0; // TODO: handle!
  }
};

const createBinaryExpression = ({
  operator,
  left,
  right,
}: BinaryExpression): number[] => [getOperatorCode(operator)];

/* Currently assumes that:
 * 1) there are no local vars
 * 2) all params are I32
 * TODO: fix this! */
const createFuncLocals = (func: Function): number[] => [
  func.params.length,
  I32_TYPE,
];

const createFunctionBody = (func: Function, body: number[]): number[] => [
  body.length,
  func.params.length, // TODO: add local definitions!
  ...createFuncLocals(func),
  ...body,
  FUNC_BODY_END_TYPE,
];

/* TODO: replace this with WASM start section
 * and pass result to JavaScript via import */
const isMainFunction = (
  identifier: Identifier,
  value: Node,
): value is Function => value.type === 'function' && identifier.name === 'run';

const generateBytecode = (program: Program): number[] => {
  const {
    functionSignatures,
    functionDeclarations,
    functionBodies,
    exports,
  } = createCompiledProgram();

  const registerFunction = (func: Function, body: number[]) => {
    functionSignatures.push(...createFunctionSignature(func));
    functionDeclarations.push(functionSignatures.length - 1);
    functionBodies.push(...createFunctionBody(func, walk(func.body, body)));
  };

  const walk = (nodes: Node[], bytes: number[] = []) => {
    for (let node of nodes) {
      switch (node.type) {
        case 'definition':
          // TODO: add non-function values to memory
          if (isMainFunction(node.identifier, node.value)) {
            registerFunction(node.value, bytes);
            exports.push(...createExport(node, functionSignatures.length - 1));
          }

          break;

        case 'function':
          registerFunction(node, bytes);
          break;

        case 'binaryExpression':
          bytes.push(...createBinaryExpression(node));
          break;
      }
    }

    return bytes;
  };

  walk(program.body);

  return [
    ...magicNumber,
    ...wasmVersion,
    TYPE_SECTION_ID,
    functionSignatures.length,
    ...functionSignatures,
    FUNCTION_SECTION_ID,
    functionDeclarations.length,
    ...functionDeclarations,
    EXPORT_SECTION_ID,
    exports.length,
    ...exports,
    // START_SECTION_ID, mainIndex <= TODO: leverage WASM intrinsic start function
    CODE_SECTION_ID,
    functionBodies.length,
    ...functionBodies,
  ];
};

export default generateBytecode;
