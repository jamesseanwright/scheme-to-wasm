import { Token } from './tokeniser';

// TODO: support source locations
type Identifier = {
  type: 'identifier';
  name: string;
};

type Expression = {
  type: 'expression';
};

type BinaryExpression = {
  type: 'binaryExpression';
  operator: string;
  left: Node; // TODO: type-safe assertion as Identifier
  right: Node;
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
  | BinaryExpression
  | Definition
  | Identifier
  | Function;

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

  const iterate = () => {
    const nodes: Node[] = [];
    let started = false;
    let openingParens = 0;
    let result = iterator.next();

    while (!result.done && (!started || openingParens > 0)) {
      started = true;
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
          value: iterate()[0],
        });
      } else if (isFunction(result.value)) {
        const params = iterate();
        const body = iterate();

        nodes.push({
          type: 'function',
          params,
          body,
        });
      } else if (result.value.type === 'name') {
        // TODO: name => identifier exclusively?
        nodes.push({
          type: 'identifier',
          name: result.value.value,
        });
      } else if (result.value.type === 'operator') {
        const operands = iterate();

        nodes.push({
          type: 'binaryExpression',
          operator: result.value.value,
          left: operands[0],
          right: operands[1],
        });
      }

      result = iterator.next();
    }

    return nodes;
  };

  return iterate();
};

const buildAST = (tokens: Token[]): Program => ({
  type: 'program',
  body: toAST(tokens),
});

export default buildAST;
