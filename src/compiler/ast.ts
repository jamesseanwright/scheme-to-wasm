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

const iterate = (
  tokens: Iterator<Token, Token>,
  currentOpenParens = 0, // Parens left open in previous iteration
) => {
  const nodes: Node[] = [];
  let started = false;
  let openParens = currentOpenParens;
  let result = tokens.next();

  while (!result.done && (!started || openParens > 0)) {
    started = true;
    // TODO: avoid duped prop name (value)
    if (result.value.value === '(') {
      openParens++;
    } else if (result.value.value === ')') {
      openParens--;
    } else if (isDefinition(result.value)) {
      const { value: name } = tokens.next().value;

      nodes.push({
        type: 'definition',
        name,
        value: iterate(tokens)[0],
      });
    } else if (isFunction(result.value)) {
      const params = iterate(tokens);
      const body = iterate(tokens);

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
      /* We pass 1 here as we already have
       * an opening parenthesis as a result
       * of using an operator, so we need to
       * scan to the next closing paren. */
      const operands = iterate(tokens, 1);

      nodes.push({
        type: 'binaryExpression',
        operator: result.value.value,
        left: operands[0],
        right: operands[1],
      });
    }

    result = tokens.next();
  }

  return nodes;
};

const buildAST = (tokens: Token[]): Program => ({
  type: 'program',
  body: iterate(tokens[Symbol.iterator]()),
});

export default buildAST;
