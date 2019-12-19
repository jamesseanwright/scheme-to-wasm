/* a general, bidirectional tree. Used
 * by our AST generator for scoping */

type Child<T> = T | Tree<T>;

interface Tree<TChild> {
  append(child: TChild): void;
  branch(): Tree<TChild>;
  parent(): Tree<TChild> | undefined;
  children(): Child<TChild>[];
}

type FindPredicate<TChild> = (child: TChild) => boolean;

export const createTree = <TChild>(parent?: Tree<TChild>): Tree<TChild> => {
  const children: Child<TChild>[] = [];

  return {
    append(child) {
      children.push(child);
    },

    branch() {
      const childTree = createTree<TChild>(this);

      children.push(childTree);

      return childTree;
    },

    parent() {
      return parent;
    },

    children() {
      return [...children];
    },
  };
};

export const findInTree = <TChild>(
  tree: Tree<TChild>,
  predicate: FindPredicate<TChild>
) => {
  throw new Error('Unimplemented');
};

export const unwrapTree = <TChild>(tree: Tree<TChild>) => {
  throw new Error('Unimplemented');
};
