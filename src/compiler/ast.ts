import { Token } from './tokeniser';
import { createTree, Tree, findBottomUp } from './tree';

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
  const createBinding = (
    { value }: Definition,
    name: string,
    scopeDeclarations: Tree<Definition>,
  ) => {
    /* Assumes every reference to
     * an identifier is a function
     * call for the time being. */
    return createCallExpression(name, doScan(1, scopeDeclarations))
  };

  const captureDefinition = (nodes: Node[], scopeDeclarations: Tree<Definition>) => {
    /* We pass 1 here as we already have
     * an opening parenthesis as a result
      * of using an operator, so we need to
    * scan to the next closing paren. */
    const [name, value] = doScan(1, scopeDeclarations) as [Identifier, Node];
    const definition = createDefinition(name, value);

    nodes.push(definition);
    scopeDeclarations.append(definition);
  };

  const captureFunction = (nodes: Node[], scopeDeclarations: Tree<Definition>) => {
    const params = doScan(0, scopeDeclarations);
    const body = doScan(0, scopeDeclarations.branch());

    nodes.push(createFunction(params, body));
  };

  const handleIdentifier = (
    nodes: Node[],
    scopeDeclarations: Tree<Definition>,
    name: string
  ) => {
    const definition = findBottomUp(
      scopeDeclarations,
      // TODO: avoid type assertion
      x => (x.identifier as Identifier).name === name,
    );

    nodes.push(
      definition
        ? createBinding(
          definition,
          name,
          scopeDeclarations,
        )
        : createIdentifier(name),
    );
  };

  const captureOperator = (
    nodes: Node[],
    scopeDeclarations: Tree<Definition>,
    operator: string,
  ) => {
    const operands = doScan(1, scopeDeclarations);

    nodes.push(
      createBinaryExpression(operator, operands),
    );
  };

  const doScan = (
    currentOpenParens: number, // Parens opened by previous iteration
    scopeDeclarations: Tree<Definition>,
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
        captureDefinition(nodes, scopeDeclarations);
      } else if (isFunction(result.value)) {
        captureFunction(nodes, scopeDeclarations);
      } else if (result.value.type === 'identifier') {
        handleIdentifier(
          nodes,
          scopeDeclarations,
          result.value.value,
        );
      } else if (result.value.type === 'operator') {
        captureOperator(
          nodes,
          scopeDeclarations,
          result.value.value,
        );
      }

      result = tokens.next();
    }

    return nodes;
  };

  return doScan(0, createTree<Definition>());
};

const buildAST = (tokens: Token[]): Program => ({
  type: 'program',
  body: scan(tokens[Symbol.iterator]()),
});

export default buildAST;
