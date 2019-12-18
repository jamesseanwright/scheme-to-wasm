import { Token } from './tokeniser';

// TODO: support source locations
type Expression = {
  type: 'expression';
};

type Program = {
  type: 'program';
  body: Node[];
};

type Definition = {
  type: 'definition';
  name: string;
  value: Node;
};

type Function = {
  type: 'function';
  params: Node[];
  body: Node[];
};

type Node =
  | Program
  | Expression
  | Definition
  | Function;

type Done = (
  result: IteratorResult<Token, Token>,
  parens: number,
) => boolean;

const isDefinition = (token: Token) =>
  token.type === 'keyword' && token.value === 'define';

const isFunction = (token: Token) =>
  token.type === 'keyword' && token.value === 'lambda';

const isExpressionBalanced = (openingParens: number) =>
  (res: IteratorResult<Token, Token>, parens: number) => res.done || parens < openingParens

const toAST = (
  tokens: Token[],
) => {
  const iterator = tokens[Symbol.iterator]() as Iterator<Token, Token>;
  let openingParens = 0;

  const iterate = (isDone: Done) => {
    const nodes: Node[] = [];
    let result = iterator.next();

    while (!isDone(result, openingParens)) {
      // TODO: avoid duped prop name (value)
      if (result.value.value === '(') {
        openingParens++;
      } else if (result.value.value === ')') {
        openingParens--;
      } else if (isDefinition(result.value)) {
        const { value: name } = iterator.next().value;

        nodes.push({
          type: 'definition',
          name,
          value: iterate(isExpressionBalanced(openingParens))[0],
        });
      } else if (isFunction(result.value)) {
        const params = iterate(
          isExpressionBalanced(openingParens),
        );

        const body = iterate(
          isExpressionBalanced(openingParens),
        );

        nodes.push({
          type: 'function',
          params,
          body,
        });
      }

      result = iterator.next();
    }

    return nodes;
  };

  return iterate(res => Boolean(res.done));
};

const buildAST = (tokens: Token[]): Program => ({
  type: 'program',
  body: toAST(tokens),
});

export default buildAST;
