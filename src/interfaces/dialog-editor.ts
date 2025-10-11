import { Node } from 'ngx-vflow';

export type DialogNodeData = {
  actionInfo: any;
  parentId: string;
  id: string;
  from?: string;
};

export type DialogEditorNode<T> = Node<T> & {
  data: DialogNodeData;
};
