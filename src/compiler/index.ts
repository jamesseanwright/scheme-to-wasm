const bytePad = (bytes: number[], totalByteLength: number) => [
  ...bytes,
  ...Array(totalByteLength - bytes.length).fill(0x0),
];

const magicNumber = [0x0, 0x61, 0x73, 0x6d];
const wasmVersion = bytePad([0x1], 4);

const compile = (source: string) => [...magicNumber, ...wasmVersion];

export default compile;
