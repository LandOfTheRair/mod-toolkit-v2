/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Component, effect, input, signal } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Edge } from 'ngx-vflow';
import { DialogEditorNode } from '../../../../interfaces';
import { DialogsEditorVisualNodeComponent } from '../dialogs-editor-visual-node/dialogs-editor-visual-node.component';

/**
 * TODO:
 * - custom handles on different sides depending on if fail/success: https://www.ngx-vflow.org/features/custom-handles (fail connects right to left, success connects bottom to top)
 *  - layout/etc: https://github.com/artem-mangilev/ngx-vflow/discussions/220
 * - list each keyword in a pill list on the left side
 */

@Component({
  selector: 'app-dialogs-editor-visual',
  standalone: false,
  templateUrl: './dialogs-editor-visual.component.html',
  styleUrl: './dialogs-editor-visual.component.scss',
})
export class DialogsEditorVisualComponent {
  public dialogTree = input.required<Record<string, any>>();

  public nodes = signal<DialogEditorNode<any>[]>([]);
  public edges = signal<Edge[]>([]);

  private currentColumn = 0;

  constructor() {
    effect(() => {
      this.parseNodesAndEdges(cloneDeep(this.dialogTree()));
    });
  }

  private parseNodesAndEdges(dialogTree: Record<string, any>) {
    const root = dialogTree.keyword as Record<string, any>;
    if (!root) return;

    this.currentColumn = 0;

    const hello = root.hello;

    const allNodes = this.recurseNode(hello.actions, 'root', 0, 0);

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
        point: { x: xPos * 450, y: yPos * 200 },
        width: 300,

        data: {
          actionInfo: node,
          id: nodeId,
          parentId: nodeIdx === 0 ? parent : `${baseId}-${nodeIdx - 1}`,
          from: extra.from ? `${extra.from}#${nodeIdx}` : undefined,
          targetHandlePosition:
            nodeIdx === 0 && extra.from === 'fail' ? 'left' : 'top',
          hasRightSourceHandle: !!node.checkPassActions,
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

        delete ret.data.actionInfo.checkPassActions;
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

        delete ret.data.actionInfo.checkFailActions;
      }
    }

    return nodeRets;
  }
}
