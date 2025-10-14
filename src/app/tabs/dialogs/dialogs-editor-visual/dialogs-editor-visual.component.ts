/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Component,
  computed,
  effect,
  inject,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { cloneDeep, get, set } from 'lodash';
import { Edge, NodeSelectedChange, VflowComponent } from 'ngx-vflow';
import {
  DialogActionType,
  DialogEditorNode,
  IDialogAction,
  IDialogTree,
} from '../../../../interfaces';
import { DialogNodeEditorService } from '../../../services/dialog-node-editor.service';
import { DialogsEditorVisualNodeComponent } from '../dialogs-editor-visual-node/dialogs-editor-visual-node.component';

@Component({
  selector: 'app-dialogs-editor-visual',
  standalone: false,
  templateUrl: './dialogs-editor-visual.component.html',
  styleUrl: './dialogs-editor-visual.component.scss',
})
export class DialogsEditorVisualComponent {
  private dialogNodeService = inject(DialogNodeEditorService);

  public dialogTree = model.required<IDialogTree>();

  private dialogTreeRef = signal<IDialogTree>({ keyword: {} });

  public nodes = signal<DialogEditorNode<any>[]>([]);
  public edges = signal<Edge[]>([]);

  public isSelectingNode = signal<boolean>(false);
  public selectedNode = signal<DialogEditorNode<any> | undefined>(undefined);

  public currentKeyword = signal<string>('hello');
  public allKeywords = computed(() =>
    Object.keys(this.dialogTreeRef().keyword ?? {}),
  );

  public vflow = viewChild<VflowComponent>('vflow');

  private currentColumn = 0;

  constructor() {
    effect(() => {
      const newTree = cloneDeep(this.dialogTree());
      this.dialogTreeRef.set(newTree);
    });

    effect(() => {
      this.parseDialogTreeKeyword(this.dialogTreeRef(), this.currentKeyword());
    });

    this.dialogNodeService.addCheckPassAction$
      .pipe(takeUntilDestroyed())
      .subscribe(({ nodePath }) => {
        this.addAction(nodePath, 'checkPassActions');
      });

    this.dialogNodeService.removeCheckPassAction$
      .pipe(takeUntilDestroyed())
      .subscribe(({ nodePath, index }) => {
        this.removeAction(nodePath, index, 'checkPassActions');
      });

    this.dialogNodeService.addCheckFailAction$
      .pipe(takeUntilDestroyed())
      .subscribe(({ nodePath }) => {
        this.addAction(nodePath, 'checkFailActions');
      });

    this.dialogNodeService.removeCheckFailAction$
      .pipe(takeUntilDestroyed())
      .subscribe(({ nodePath, index }) => {
        this.removeAction(nodePath, index, 'checkFailActions');
      });

    this.dialogNodeService.addQuestCompleteAction$
      .pipe(takeUntilDestroyed())
      .subscribe(({ nodePath }) => {
        this.addAction(nodePath, 'questCompleteActions');
      });

    this.dialogNodeService.removeQuestCompleteAction$
      .pipe(takeUntilDestroyed())
      .subscribe(({ nodePath, index }) => {
        this.removeAction(nodePath, index, 'questCompleteActions');
      });
  }

  private parseDialogTreeKeyword(tree: IDialogTree, keyword: string) {
    const root = tree.keyword;
    if (!root) return;

    const keywordContainer = root[keyword];
    if (!keywordContainer || !keywordContainer.actions) return;

    this.currentColumn = 0;

    const allNodes = this.recurseNode(keywordContainer.actions, 'root', 0, 0);

    const allEdges: Edge[] = [];

    allNodes.forEach((node) => {
      if (!node.data.parentId) return;

      const edge: Edge = {
        id: `edge-[${node.data.parentId}]-[${node.id}]`,
        source: node.data.parentId,
        target: node.data.id,
        curve: 'straight',
      };

      if (node.data.from) {
        edge.edgeLabels = {
          center: {
            type: 'default',
            text: node.data.from,
            style: {
              color: '#ff',
              background: '#1d232a',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
            },
          },
        };

        edge.markers = {
          end: { type: 'arrow' },
        };
      }

      if (node.data.targetHandlePosition === 'left') {
        edge.sourceHandle = 'out-fail';
        edge.targetHandle = 'in';
      }

      allEdges.push(edge);
    });

    this.nodes.set(allNodes);
    this.edges.set(allEdges);
  }

  private recurseNode(
    nodes: any[],
    parent = '',
    row = 0,
    col = 0,
    extra: any = {},
  ): DialogEditorNode<any>[] {
    const nodeRets: DialogEditorNode<any>[] = [];

    const parentPath = extra.path ?? '';
    const baseId = `${parent}.${row}`;

    for (let nodeIdx = 0; nodeIdx < nodes.length; nodeIdx++) {
      const node = nodes[nodeIdx];
      if (!node) continue;

      const myPath = parentPath ? `${parentPath}.${nodeIdx}` : `${nodeIdx}`;

      const xPos = col;
      const yPos = row + nodeIdx;

      const nodeId = `${baseId}-${nodeIdx}`;

      const ret: DialogEditorNode<any> = {
        type: DialogsEditorVisualNodeComponent,

        draggable: false,
        point: { x: xPos * 500, y: yPos * 200 },
        width: 350,
        height: 150,

        data: {
          actionInfo: node,
          nodeFrom: extra.from ?? '',
          nodeIndex: nodeIdx,
          nodePath: myPath,
          id: nodeId,
          parentId: nodeIdx === 0 ? parent : `${baseId}-${nodeIdx - 1}`,
          from: extra.from ? `${extra.from}#${nodeIdx + 1}` : undefined,
          targetHandlePosition:
            nodeIdx === 0 && ['fail', 'questComplete'].includes(extra.from)
              ? 'left'
              : 'top',
          hasRightSourceHandle:
            !!node.checkPassActions || node.questCompleteActions,
        },

        id: nodeId,
      };

      nodeRets.push(ret);

      if (ret.data.actionInfo.checkPassActions) {
        nodeRets.push(
          ...this.recurseNode(
            ret.data.actionInfo.checkPassActions,
            nodeId,
            yPos + 1,
            xPos,
            { path: `${myPath}.checkPassActions`, from: 'success' },
          ),
        );
      }

      if (ret.data.actionInfo.checkFailActions) {
        this.currentColumn += 1;

        nodeRets.push(
          ...this.recurseNode(
            ret.data.actionInfo.checkFailActions,
            nodeId,
            yPos,
            this.currentColumn,
            { path: `${myPath}.checkFailActions`, from: 'fail' },
          ),
        );
      }

      if (ret.data.actionInfo.questCompleteActions) {
        this.currentColumn += 1;

        nodeRets.push(
          ...this.recurseNode(
            ret.data.actionInfo.questCompleteActions,
            nodeId,
            yPos,
            this.currentColumn,
            {
              path: `${myPath}.questCompleteActions`,
              from: 'questComplete',
            },
          ),
        );
      }
    }

    return nodeRets;
  }

  public changeKeyword(newKeyword: string) {
    this.currentKeyword.set(newKeyword);
    this.unselectNode();
  }

  public addNewKeyword(newKeyword: string) {
    if (!newKeyword.trim()) return;
    if (this.allKeywords().includes(newKeyword)) return;

    const tree = this.dialogTreeRef();
    tree.keyword = tree.keyword ?? {};
    tree.keyword[newKeyword] = {
      actions: [this.defaultActionData()],
    };

    this.dialogTree.set(tree);
    this.changeKeyword(newKeyword);
  }

  public selectNode(node: NodeSelectedChange) {
    if (!node.selected) return;

    const nodeId = node.id;
    const nodeData = this.nodes().find((n) => n.id === nodeId);

    this.isSelectingNode.set(true);

    setTimeout(() => {
      this.selectedNode.set(nodeData);
      this.isSelectingNode.set(false);
    }, 50);
  }

  public unselectNode() {
    this.selectedNode.set(undefined);
    (this.vflow() as any).nodeModels().forEach((nodeModel: any) => {
      nodeModel.selected.set(false);
    });
  }

  public saveNode(nodeData: IDialogAction) {
    const path = this.selectedNode()?.data.nodePath;
    if (!path) return;

    const treeData = this.dialogTree();

    set(
      treeData.keyword[this.currentKeyword()].actions,
      path.split('.'),
      nodeData,
    );

    this.dialogTree.set(cloneDeep(treeData));

    this.unselectNode();
  }

  private defaultActionData(): IDialogAction {
    return {
      type: DialogActionType.Chat,
      message: 'Hello, ${ name }!',
      options: [{ text: 'Goodbye.', action: 'noop', requirement: {} }],
    } as IDialogAction;
  }

  private addAction(
    nodePath: string,
    type: 'checkPassActions' | 'checkFailActions' | 'questCompleteActions',
  ) {
    const treeData = this.dialogTree();
    const actions = treeData.keyword?.[this.currentKeyword()]?.actions;
    if (!actions) return;

    const parentPath = nodePath.split('.');
    const targetNode = get(actions, parentPath) as IDialogAction;
    if (!targetNode || !targetNode[type]) return;

    targetNode[type].push(this.defaultActionData());

    this.dialogTree.set(cloneDeep(treeData));
  }

  private removeAction(
    nodePath: string,
    index: number,
    type: 'checkPassActions' | 'checkFailActions' | 'questCompleteActions',
  ) {
    const treeData = this.dialogTree();
    const actions = treeData.keyword?.[this.currentKeyword()]?.actions;
    if (!actions) return;

    const parentPath = nodePath.split('.').slice(0, -2);
    const targetNode = get(actions, parentPath) as IDialogAction;
    if (!targetNode || !targetNode[type]) return;

    targetNode[type].splice(index, 1);

    this.dialogTree.set(cloneDeep(treeData));
  }
}
