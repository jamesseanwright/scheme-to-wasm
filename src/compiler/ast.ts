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
  identifier: Node; // TODO: type-safe assertion as Identifier
  value: Node;
};

type Function = {
  type: 'function';
  params: Node[];
  body: Node[];
};

type CallExpression = {
  type: 'callExpression',
  callee: Node,
  args: Node[],
};

type Node =
  | Program
  | Expression
  | BinaryExpression
  | CallExpression
  | Definition
  | Identifier
  | Function;

const isDefinition = (token: Token) =>
  token.type === 'keyword' && token.value === 'define';

const isFunction = (token: Token) =>
  token.type === 'keyword' && token.value === 'lambda';

const createDefinition = (identifier: Node, value: Node): Definition => ({
  type: 'definition',
  identifier,
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

const createCallExpression = (
  name: string,
  args: Node[],
): CallExpression => ({
  type: 'callExpression',
  callee: createIdentifier(name),
  args,
});

const scan = (
  tokens: Iterator<Token, Token>,
) => {
  // TODO: lexical scoping!
  const definitions: Definition[] = [];

  const createBinding = ({ value }: Definition, name: string) => {
    /* Assumes every reference to
     * an identifier is a function
     * call for the time being. */
    return createCallExpression(name, doScan(1))
  };

  const doScan = (
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
        const [name, value] = doScan(1) as [Identifier, Node];
        const definition = createDefinition(name, value);

        nodes.push(definition);
        definitions.push(definition);
      } else if (isFunction(result.value)) {
        const params = doScan();
        const body = doScan();

        nodes.push(createFunction(params, body));
      } else if (result.value.type === 'identifier') {
        // TODO: remove type assertions
        const definition = nodes.find(d => (d.type === 'definition' && (d.identifier as Identifier).name === result.value.value)) as Definition;
        nodes.push(
          definition
            ? createBinding(definition, result.value.value)
            : createIdentifier(result.value.value),
        );
      } else if (result.value.type === 'operator') {
        const operands = doScan(1);

        nodes.push(
          createBinaryExpression(result.value.value, operands),
        );
      }

      result = tokens.next();
    }

    return nodes;
  };

  return doScan();
};

const buildAST = (tokens: Token[]): Program => ({
  type: 'program',
  body: scan(tokens[Symbol.iterator]()),
});

export default buildAST;
