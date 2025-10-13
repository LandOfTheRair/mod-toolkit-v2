/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Component,
  computed,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { cloneDeep } from 'lodash';
import { Edge, NodeSelectedChange, VflowComponent } from 'ngx-vflow';
import {
  DialogEditorNode,
  IDialogAction,
  IDialogTree,
} from '../../../../interfaces';
import { DialogsEditorVisualNodeComponent } from '../dialogs-editor-visual-node/dialogs-editor-visual-node.component';

@Component({
  selector: 'app-dialogs-editor-visual',
  standalone: false,
  templateUrl: './dialogs-editor-visual.component.html',
  styleUrl: './dialogs-editor-visual.component.scss',
})
export class DialogsEditorVisualComponent {
  public dialogTree = input.required<IDialogTree>();

  private dialogTreeRef = computed(() =>
    cloneDeep(this.dialogTree() ?? { keyword: {} }),
  );

  public nodes = signal<DialogEditorNode<any>[]>([]);
  public edges = signal<Edge[]>([]);
  public selectedNode = signal<DialogEditorNode<any> | undefined>(undefined);

  public currentKeyword = signal<string>('hello');
  public allKeywords = computed(() =>
    Object.keys(this.dialogTreeRef().keyword ?? {}),
  );

  public vflow = viewChild<VflowComponent>('vflow');

  private currentColumn = 0;

  constructor() {
    effect(() => {
      this.parseDialogTreeKeyword(this.dialogTree(), this.currentKeyword());
    });
  }

  private parseDialogTreeKeyword(tree: IDialogTree, keyword: string) {
    console.log(tree, keyword);
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

    const baseId = `${parent}.${row}`;

    for (let nodeIdx = 0; nodeIdx < nodes.length; nodeIdx++) {
      const node = nodes[nodeIdx];
      if (!node) continue;

      const xPos = col;
      const yPos = row + nodeIdx;

      const nodeId = `${baseId}-${nodeIdx}`;

      const ret: DialogEditorNode<any> = {
        type: DialogsEditorVisualNodeComponent,

        draggable: false,
        point: { x: xPos * 500, y: yPos * 200 },
        width: 300,

        data: {
          actionInfo: node,
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
            { from: 'success' },
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
            { from: 'fail' },
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
            { from: 'questComplete' },
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

  public selectNode(node: NodeSelectedChange) {
    if (!node.selected) return;

    const nodeId = node.id;
    const nodeData = this.nodes().find((n) => n.id === nodeId);
    this.selectedNode.set(nodeData);
  }

  public unselectNode() {
    this.selectedNode.set(undefined);
    (this.vflow() as any).nodeModels().forEach((nodeModel: any) => {
      nodeModel.selected.set(false);
    });
  }

  public saveNode(nodeData: IDialogAction) {
    console.log(nodeData);
  }
}
