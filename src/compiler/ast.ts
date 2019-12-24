import { Token } from './tokeniser';
import { createTree, Tree, findBottomUp } from './tree';

// TODO: support source locations
export type Identifier = {
  type: 'identifier';
  name: string;
};

type Operand = Identifier | Literal;

type BinaryExpression = {
  type: 'binaryExpression';
  operator: string;
  left: Operand;
  right: Operand;
};

export type Program = {
  type: 'program';
  body: Node[];
};

export type Definition = {
  type: 'definition';
  identifier: Identifier;
  value: Node;
};

type Literal = {
  type: 'literal';
  value: string;
};

export type Function = {
  type: 'function';
  params: Node[];
  body: Node[];
};

type CallExpression = {
  type: 'callExpression';
  callee: Node;
  args: Node[];
};

export type Node =
  | Program
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

const createDefinition = (identifier: Identifier, value: Node): Definition => ({
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
  operands: Operand[],
): BinaryExpression => ({
  type: 'binaryExpression',
  operator,
  left: operands[0],
  right: operands[1],
});

const createCallExpression = (name: string, args: Node[]): CallExpression => ({
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

  return openParens + (value.value === '(' ? 1 : -1);
};

const buildNodes = (tokens: Iterator<Token, Token>) => {
  const createBinding = (
    { identifier, value }: Definition,
    name: string,
    scopeDeclarations: Tree<Definition>,
  ) => {
    switch (value.type) {
      case 'function':
        return createCallExpression(name, scan(scopeDeclarations, 1));

      default:
        return identifier;
    }
  };

  const captureDefinition = (
    nodes: Node[],
    scopeDeclarations: Tree<Definition>,
  ) => {
    const [name, value] = scan(scopeDeclarations, 1, 2) as [Identifier, Node];
    const definition = createDefinition(name, value);

    nodes.push(definition);
    scopeDeclarations.append(definition);
  };

  const captureFunction = (
    nodes: Node[],
    scopeDeclarations: Tree<Definition>,
  ) => {
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
      x => x.identifier.name === name,
    );

    nodes.push(
      definition
        ? createBinding(definition, name, scopeDeclarations)
        : createIdentifier(name),
    );
  };

  const captureOperator = (
    nodes: Node[],
    scopeDeclarations: Tree<Definition>,
    operator: string,
  ) => {
    const operands = scan(scopeDeclarations, 1) as Operand[];

    nodes.push(createBinaryExpression(operator, operands));
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
    [token => token.type === 'number', captureLiteral],
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
      findCapturer(result.value)(nodes, scopeDeclarations, result.value.value);

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
