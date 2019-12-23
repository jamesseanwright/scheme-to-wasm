import { Program } from './ast';

const TYPE_SECTION_ID = 0x1;
const FUNCTION_SECTION_ID = 0x3;
const CODE_SECTION_ID = 0xA;

const bytePad = (bytes: number[], totalByteLength: number): number[] => [
  ...bytes,
  ...Array(totalByteLength - bytes.length).fill(0x0),
];

const magicNumber = [0x0, 0x61, 0x73, 0x6d];
const wasmVersion = bytePad([0x1], 4);

// TODO: 'literal' AST Node => 'number'
// TODO: i64/f32/f64 support
const types = new Map<string, number>([
  ['number', 0x7F]
]);

const generateBytecode = (program: Program): number[] => {
  const functionSignatures: number[] = [];
  const functionDeclarations: number[] = [];
  const functionBodies: number[] = [];

  return [
    ...magicNumber,
    ...wasmVersion,
    TYPE_SECTION_ID, ...functionSignatures,
    FUNCTION_SECTION_ID, ...functionDeclarations,
    CODE_SECTION_ID, ...functionBodies,
  ];
};

export default generateBytecode;
