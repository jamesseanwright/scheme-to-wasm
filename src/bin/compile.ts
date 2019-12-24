import compileFileToBinary from '../compiler';

// TODO: validate args

const [, , sourcePath, targetDir] = process.argv;

compileFileToBinary(sourcePath, targetDir);
