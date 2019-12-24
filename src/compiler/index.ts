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
  absPath: string,
  targetDir: string,
) => {
  const { name: filename } = path.parse(absPath);
  logger.log(`🛠 Compiling ${filename}...`);

  // TODO: Try<T> monad
  try {
    const source = fs.readFileSync(filename).toString();
    const bytes = compile(source);
    const targetFile = filename.replace(/.scm$/, '.wasm');
    const targetPath = path.join(targetDir, targetFile);

    fs.writeFileSync(targetPath, new Uint8Array(bytes), 'bin');
    logger.log(`✅ Compiled ${filename} to ${targetPath}!`);
  } catch (e) {
    logger.error(`❌ Unable to compile ${filename}:`, e);
  }
};

export default compileFileToBinary(console);
