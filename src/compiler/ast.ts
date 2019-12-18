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
  name: Node; // TODO: type-safe assertion as Identifier
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

const createDefinition = (name: Node, value: Node): Definition => ({
  type: 'definition',
  name,
  value,
});

const createFunction = (params: Node[], body: Node[]): Function => ({
  type: 'function',
  params,
  body,
});

const createIdentifier = (name: string): Identifier => ({
  type: 'identifier',
  name,
});

const createBinaryExpression = (
  operator: string,
  operands: Node[],
): BinaryExpression => ({
  type: 'binaryExpression',
  operator,
  left: operands[0],
  right: operands[1],
});

const scan = (
  tokens: Iterator<Token, Token>,
  currentOpenParens = 0, // Parens opened by previous iteration
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
      /* We pass 1 here as we already have
       * an opening parenthesis as a result
       * of using an operator, so we need to
       * scan to the next closing paren. */
      const [name, value] = scan(tokens, 1);

      nodes.push(createDefinition(name, value));
    } else if (isFunction(result.value)) {
      const params = scan(tokens);
      const body = scan(tokens);

      nodes.push(createFunction(params, body));
    } else if (result.value.type === 'identifier') {
      nodes.push(createIdentifier(result.value.value));
    } else if (result.value.type === 'operator') {
      const operands = scan(tokens, 1);

      nodes.push(
        createBinaryExpression(result.value.value, operands),
      );
    }

    result = tokens.next();
  }

  return nodes;
};

const buildAST = (tokens: Token[]): Program => ({
  type: 'program',
  body: scan(tokens[Symbol.iterator]()),
});

export default buildAST;
