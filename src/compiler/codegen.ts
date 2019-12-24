import { Program, Node, Function, Definition } from './ast';

const TYPE_SECTION_ID = 0x1;
const FUNCTION_SECTION_ID = 0x3;
const EXPORT_SECTION_ID = 0x7;
const START_SECTION_ID = 0x8;
const CODE_SECTION_ID = 0xA;

const FUNC_TYPE = -0x20;
const I32_TYPE = -0x01;

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

const createFunctionSignature = ({ params }: Function): number[] => [
  FUNC_TYPE,
  params.length,
  ...Array(params.length).fill(I32_TYPE),
  1,
  I32_TYPE, // TODO: add return type to AST entry or grab from body
];

const createExport = ({ identifier, value }: Definition): number[] => [
  identifier.name.length,
  ...stringToBytes(identifier.name),
  FUNC_EXTERNAL_KIND, // only function exports are supported in the MVP
  // function declaration index here!
];

/* TODO: replace this with WASM start section
 * and pass result to JavaScript via import */
const isMainFunction = ({ identifier, value }: Definition) =>
  value.type === 'function' && identifier.name === 'run';

const generateBytecode = (program: Program): number[] => {
  const functionSignatures: number[] = [];
  const functionDeclarations: number[] = [];
  const functionBodies: number[] = [];
  const exports: number[] = [];

  const walk = (nodes: Node[]) => {
    for (let node of nodes) {
      switch (node.type) {
        case 'definition':
          if (isMainFunction(node)) {
            exports.push(...createExport(node));
          }

          break;

        case 'function':
          functionSignatures.push(...createFunctionSignature(node));
          functionDeclarations.push(functionSignatures.length - 1);
          break;
      }
    }
  };

  walk(program.body);

  return [
    ...magicNumber,
    ...wasmVersion,
    TYPE_SECTION_ID, functionSignatures.length, ...functionSignatures,
    FUNCTION_SECTION_ID, functionDeclarations.length, ...functionDeclarations,
    EXPORT_SECTION_ID, 1,
    // START_SECTION_ID, mainIndex <= TODO: leverage WASM intrinsic start function
    CODE_SECTION_ID, functionBodies.length, ...functionBodies,
  ];
};

export default generateBytecode;
