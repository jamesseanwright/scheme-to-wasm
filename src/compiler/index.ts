import * as fs from 'fs';
import * as path from 'path';
import tokenise from './tokeniser';
import buildAST from './ast';
import generateBytecode from './codegen';

export const compile = (source: string) => {
  const tokens = tokenise(source);
  const ast = buildAST(tokens);

  return generateBytecode(ast);
};

const compileFileToBinary = (logger: typeof console) => (
  sourcePath: string,
  targetDir: string,
) => {
  const { name, ext } = path.parse(sourcePath);
  const filename = `${name}${ext}`;
  logger.log(`🛠  Compiling ${filename}...`);

  // TODO: Try<T> monad
  try {
    const source = fs.readFileSync(sourcePath).toString();
    const bytes = compile(source);
    const targetFile = filename.replace(/.scm$/, '.wasm');
    const targetPath = path.join(targetDir, targetFile);

    fs.writeFileSync(targetPath, new Uint8Array(bytes));
    logger.log(`✅  Compiled ${filename} to ${targetPath}!`);
  } catch (e) {
    logger.error(`❌  Unable to compile ${filename}:`, e);
  }
};

export default compileFileToBinary(console);
