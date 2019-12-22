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

type Literal = {
  type: 'literal';
  value: string;
};

type Function = {
  type: 'function';
  params: Node[];
  body: Node[];
};

type CallExpression = {
  type: 'callExpression';
  callee: Node;
  args: Node[];
};

type Node =
  | Program
  | Expression
  | BinaryExpression
  | CallExpression
  | Definition
  | Identifier
  | Literal
  | Function;

type TokenPredicate = (token: Token) => boolean;

type NodeCapturer = (
  nodes: Node[],
  scopeDeclarations: Tree<Definition>,
  operator: string,
) => void;

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

const createLiteral = (value: string): Literal => ({
  type: 'literal',
  value,
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

const handleOpenParens = (
  openParens: number,
  { done, value }: IteratorResult<Token, Token>,
) => {
  if (done || value.type !== 'paren') {
    return openParens;
  }

  return openParens + (value.value === '('
    ? 1
    : -1
  );
};

const buildNodes = (
  tokens: Iterator<Token, Token>,
) => {
  const createBinding = (
    { identifier, value }: Definition,
    name: string,
    scopeDeclarations: Tree<Definition>,
  ) => {
    switch (value.type) {
      case 'function':
        return createCallExpression(
          name,
          scan(scopeDeclarations, 1),
        );

      default:
        return identifier;
    }
    /* Assumes every reference to
     * an identifier is a function
     * call for the time being. */

  };

  const captureDefinition = (nodes: Node[], scopeDeclarations: Tree<Definition>) => {
    const [name, value] = scan(scopeDeclarations, 1, 2) as [Identifier, Node];
    const definition = createDefinition(name, value);

    nodes.push(definition);
    scopeDeclarations.append(definition);
  };

  const captureFunction = (nodes: Node[], scopeDeclarations: Tree<Definition>) => {
    const scope = scopeDeclarations.branch();
    const params = scan(scope);
    const body = scan(scope);

    nodes.push(createFunction(params, body));
  };

  const handleIdentifier = (
    nodes: Node[],
    scopeDeclarations: Tree<Definition>,
    name: string,
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
    const operands = scan(scopeDeclarations, 1);

    nodes.push(
      createBinaryExpression(operator, operands),
    );
  };

  const captureLiteral = (
    nodes: Node[],
    scopeDeclarations: Tree<Definition>,
    value: string,
  ) => {
    nodes.push(createLiteral(value));
  };

  const nodeCapturers = new Map<TokenPredicate, NodeCapturer>([
    [isDefinition, captureDefinition],
    [isFunction, captureFunction],
    [token => token.type === 'identifier', handleIdentifier],
    [token => token.type === 'operator', captureOperator],
    [token => token.type === 'number', captureLiteral]
  ]);

  const findCapturer = (token: Token) => {
    for (let [predicate, capturer] of nodeCapturers) {
      if (predicate(token)) {
        return capturer;
      }
    }

    // No-op fallback
    return () => undefined;
  };

  const scan = (
    scopeDeclarations: Tree<Definition>,
    unterminatedSexps = 0,
    scanLimit = Number.POSITIVE_INFINITY,
  ) => {
    const nodes: Node[] = [];
    let result = tokens.next();
    let openParens = handleOpenParens(unterminatedSexps, result);

    while (!result.done && openParens > 0 && nodes.length < scanLimit) {
      // TODO: avoid duped prop name (value)
      findCapturer(result.value)(
        nodes,
        scopeDeclarations,
        result.value.value,
      );

      result = tokens.next();
      openParens = handleOpenParens(openParens, result);
    }

    return nodes;
  };

  return scan(createTree<Definition>());
};

const buildAST = (tokens: Token[]): Program => ({
  type: 'program',
  body: buildNodes(tokens[Symbol.iterator]()),
});

export default buildAST;
