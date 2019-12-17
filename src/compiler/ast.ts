import { Token } from './tokeniser';

type NodeType =
  | 'program'
  | 'expression';

// TODO: support source locations
interface Node {
  type: NodeType;
}

interface Expression extends Node {
  type: 'expression';
}

interface Program extends Node {
  type: 'program';
  body: Expression[];
}

const buildAST = (tokens: Token[]): Program => ({
  type: 'program',
  body: [],
});

export default buildAST;
