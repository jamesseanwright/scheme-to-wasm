import { Token } from './tokeniser';

type NodeType =
  | 'program';

// TODO: support source locations
interface Node {
  type: NodeType;
}

interface Program extends Node {
  type: 'program';
}

const buildAST = (tokens: Token[]): Program => ({
  type: 'program',
});

export default buildAST;
