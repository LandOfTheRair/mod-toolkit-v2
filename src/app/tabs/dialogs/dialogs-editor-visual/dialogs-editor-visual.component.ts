/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Component, effect, input, signal } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Edge } from 'ngx-vflow';
import { DialogEditorNode } from '../../../../interfaces';
import { DialogsEditorVisualNodeComponent } from '../dialogs-editor-visual-node/dialogs-editor-visual-node.component';

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

  constructor() {
    effect(() => {
      this.parseNodesAndEdges(cloneDeep(this.dialogTree()));
    });
  }

  private parseNodesAndEdges(dialogTree: Record<string, any>) {
    const root = dialogTree.keyword as Record<string, any>;
    if (!root) return;

    const subNodes = Object.keys(root);
    subNodes.forEach((nodeKey, nodeIdx) => {
      const allNodes = this.recurseNode(
        root[nodeKey].actions,
        'root',
        nodeIdx,
        0,
      );

      const allEdges: Edge[] = [];

      allNodes.forEach((node) => {
        if (!node.data.parent) return;

        const edge: Edge = {
          id: `edge-${node.data.parentId}-${node.id}`,
          source: node.data.parentId,
          target: node.id,
          // curve: 'smooth-step',
        };

        if (node.data.from) {
          edge.edgeLabels = {
            center: {
              type: 'default',
              text: node.data.from,
            },
          };
        }

        allEdges.push(edge);
      });

      this.nodes.set(allNodes);
      this.edges.set(allEdges);
    });
  }

  private recurseNode(
    nodes: any[],
    parent = '',
    depth = 0,
    idx = 0,
    extra: any = {},
  ): DialogEditorNode<any>[] {
    const nodeRets: DialogEditorNode<any>[] = [];

    const baseId = `node-${depth}-${idx}`;

    for (let nodeIdx = 0; nodeIdx < nodes.length; nodeIdx++) {
      const node = nodes[nodeIdx];
      if (!node) continue;

      const nodeId = `${baseId}-${nodeIdx}`;

      const ret: DialogEditorNode<any> = {
        type: DialogsEditorVisualNodeComponent,

        point: { x: depth * 400, y: nodeIdx * 150 + idx * 50 },
        width: 300,

        data: {
          actionInfo: node,
          id: nodeId,
          parentId: parent,
          from: extra.from ?? undefined,
        },

        id: nodeId,
      };

      nodeRets.push(ret);

      if (ret.data.actionInfo.checkPassActions) {
        nodeRets.push(
          ...this.recurseNode(
            ret.data.actionInfo.checkPassActions,
            nodeId,
            depth + 1,
            nodeIdx,
            { from: 'checkPassActions' },
          ),
        );

        delete ret.data.actionInfo.checkPassActions;
      }

      if (ret.data.actionInfo.checkFailActions) {
        nodeRets.push(
          ...this.recurseNode(
            ret.data.actionInfo.checkFailActions,
            nodeId,
            depth + 2,
            nodeIdx,
            { from: 'checkFailActions' },
          ),
        );

        delete ret.data.actionInfo.checkFailActions;
      }
    }

    return nodeRets;
  }
}
