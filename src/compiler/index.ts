import tokenise from './tokeniser';
import buildAST from './ast';
import generateBytecode from './codegen';

const compile = (source: string) => {
  const tokens = tokenise(source);
  const ast = buildAST(tokens);

  return generateBytecode(ast);
};

export default compile;
