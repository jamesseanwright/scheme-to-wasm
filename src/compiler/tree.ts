/* a general, bidirectional tree. Used
 * by our AST generator for scoping */

interface Tree<TChild> {
  append(child: TChild): void;
  branch(): Tree<TChild>;
  parent(): Tree<TChild>;
  unwrap(): TChild[];
}

type FindPredicate<TChild> = (child: TChild) => boolean;

export const createTree = <TChild>(parent?: TChild): Tree<TChild> => ({
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

export const findInTree = <TChild>(
  tree: Tree<TChild>,
  predicate: FindPredicate<TChild>
) => {
  throw new Error('Unimplemented');
};
