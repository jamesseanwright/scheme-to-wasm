/* a general, bidirectional tree. Used
 * by our AST generator for scoping */

interface Tree<TChild> {
  append(child: TChild): void;
  branch(): Tree<TChild>;
  parent(): Tree<TChild>;
  unwrap(): Tree<TChild>[];
}

const createTree = <TChild>(parent?: TChild): Tree<TChild> => ({
  append(child) {
    throw new Error('Unimplemented');
  },

  branch() {
    throw new Error('Unimplemented');
  },

  parent() {
    throw new Error('Unimplemented');
  },

  unwrap() {
    throw new Error('Unimplemented');
  },
});

export default createTree();
