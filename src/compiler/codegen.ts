import { Program, Node, Function } from './ast';

const TYPE_SECTION_ID = 0x1;
const FUNCTION_SECTION_ID = 0x3;
const START_SECTION_ID = 0x8;
const CODE_SECTION_ID = 0xA;

const FUNC_TYPE = -0x20;
const I32_TYPE = -0x01;

const bytePad = (bytes: number[], totalByteLength: number): number[] => [
  ...bytes,
  ...Array(totalByteLength - bytes.length).fill(0x0),
];

const magicNumber = [0x0, 0x61, 0x73, 0x6d];
const wasmVersion = bytePad([0x1], 4);

const createFunctionSignature = ({ params }: Function): number[] => [
  FUNC_TYPE,
  params.length,
  ...Array(params.length).fill(I32_TYPE),
  1,
  I32_TYPE, // TODO: add return type to AST entry or grab from body
];

const generateBytecode = (program: Program): number[] => {
  const functionSignatures: number[] = [];
  const functionDeclarations: number[] = [];
  const functionBodies: number[] = [];

  let mainIndex = 0;

  const walk = (nodes: Node[]) => {
    for (let node of nodes) {
      switch (node.type) {
        case 'function':
          functionSignatures.push(...createFunctionSignature(node));
          functionDeclarations.push(functionSignatures.length - 1);

          if (node.isMain) {
            mainIndex = functionSignatures.length - 1;
          }
      }
    }
  };

  walk(program.body);

  return [
    ...magicNumber,
    ...wasmVersion,
    TYPE_SECTION_ID, functionSignatures.length, ...functionSignatures,
    FUNCTION_SECTION_ID, functionDeclarations.length, ...functionDeclarations,
    START_SECTION_ID, mainIndex,
    CODE_SECTION_ID, functionBodies.length, ...functionBodies,
  ];
};

export default generateBytecode;
