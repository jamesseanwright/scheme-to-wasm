/* a multiway tree used by our
 * AST generator for scoping */

type Child<T> = T | Tree<T>;

interface Tree<TChild> {
  append(child: TChild): void;
  branch(): Tree<TChild>;
  parent(): Tree<TChild> | undefined;
  children(): Child<TChild>[];
}

type FindPredicate<TChild> = (child: TChild) => boolean;

const isTree = <TChild>(child: Child<TChild>): child is Tree<TChild> =>
  ['append', 'branch', 'parent', 'children'].every(
    (k: keyof Tree<TChild>) =>
      typeof (child as Tree<TChild>)[k] === 'function'
  );

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

/* Doesn't search through descendants
 * of siblings for a given child tree,
 * but this isn't necessary for our use
 * case as a sibling or younger would
 * suggest an entirely separate scope */
export const findBottomUp = <TChild>(
  tree: Tree<TChild>,
  predicate: FindPredicate<TChild>
): TChild | undefined => {
  const result = tree.children().find(predicate) as TChild | undefined;
  const parent = tree.parent();

  return result ?? (parent && findBottomUp(parent, predicate));
}

export const unwrapTree = <TChild>(tree: Tree<TChild>) => {
  throw new Error('Unimplemented');
};
