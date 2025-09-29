import { Component, computed, OnInit, viewChild } from '@angular/core';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import {
  ITraitTree,
  ITraitTreeRow,
  ITraitTreeRowTrait,
  ITraitTreeTab,
} from '../../../../interfaces';
import { ISTEM } from '../../../../interfaces/stem';
import { EditorBaseComponent } from '../../../shared/components/editor-base/editor-base.component';

function defaultTreeRowTrait(): ITraitTreeRowTrait {
  return {
    maxLevel: 1,
    name: undefined as unknown as string,
    requires: undefined as unknown as string,
  };
}

function defaultTreeRow(): ITraitTreeRow {
  return {
    traits: [
      defaultTreeRowTrait(),
      defaultTreeRowTrait(),
      defaultTreeRowTrait(),
      defaultTreeRowTrait(),
      defaultTreeRowTrait(),
    ],
  };
}

export function defaultTree(name: string): ITraitTreeTab {
  return {
    desc: `The ${name} tree`,
    tree: [
      defaultTreeRow(),
      defaultTreeRow(),
      defaultTreeRow(),
      defaultTreeRow(),
      defaultTreeRow(),
    ],
  };
}

@Component({
  selector: 'app-trait-trees-editor',
  templateUrl: './trait-trees-editor.component.html',
  styleUrl: './trait-trees-editor.component.scss',
})
export class TraitTreesEditorComponent
  extends EditorBaseComponent<ITraitTree>
  implements OnInit
{
  public renameSwal = viewChild<SwalComponent>('renameTree');

  public canSave = computed(() => {
    const data = this.editing();
    return (
      data.name &&
      this.satisfiesUnique() &&
      data.data.treeOrder.length > 0 &&
      !this.isSaving()
    );
  });

  public satisfiesUnique = computed(() => {
    const data = this.editing();
    return !this.modService.doesExistDuplicate<ITraitTree>(
      'traitTrees',
      'name',
      data.name,
      data._id
    );
  });

  public treeTabs = computed(() => {
    const data = this.editing();
    return [
      {
        name: 'Core Settings',
      },
      ...data.data.treeOrder.map((t) => ({
        name: t,
      })),
    ];
  });

  ngOnInit() {
    super.ngOnInit();
  }

  addTraitTree(treeName: string) {
    const name = treeName.trim();
    if (!name) return;

    this.editing.update((editing) => {
      editing.data.treeOrder = [...editing.data.treeOrder, treeName];
      editing.data.trees[treeName] = defaultTree(treeName);

      return structuredClone(editing);
    });
  }

  async changeTreeName(index: number) {
    const baseName = this.editing().data.treeOrder[index];

    const swal = this.renameSwal();
    if (!swal) return;

    const newNameV = await swal.fire();
    const newName = newNameV.value?.trim();
    if (!newName) return;

    this.editing.update((editing) => {
      editing.data.treeOrder[index] = newName;
      editing.data.trees[newName] = editing.data.trees[baseName];
      delete editing.data.trees[baseName];

      return structuredClone(editing);
    });
  }

  moveTreeUp(index: number) {
    this.editing.update((editing) => {
      const oldTree = editing.data.treeOrder[index];

      editing.data.treeOrder.splice(index, 1);
      editing.data.treeOrder.splice(index - 1, 0, oldTree);
      return structuredClone(editing);
    });
  }

  moveTreeDown(index: number) {
    this.editing.update((editing) => {
      const oldTree = editing.data.treeOrder[index];

      editing.data.treeOrder.splice(index, 1);
      editing.data.treeOrder.splice(index + 1, 0, oldTree);
      return structuredClone(editing);
    });
  }

  removeTree(index: number) {
    this.editing.update((editing) => {
      const treeName = editing.data.treeOrder[index];

      delete editing.data.trees[treeName];
      editing.data.treeOrder.splice(index, 1);
      return structuredClone(editing);
    });
  }

  lookupSTEMInfo(traitName: string): ISTEM | undefined {
    if (!traitName) return undefined;

    return this.modService
      .mod()
      .stems.find(
        (s) => s._gameId === traitName || s.trait?.name === traitName
      );
  }

  changeTrait(
    $event: string | undefined,
    tree: ITraitTreeRow[],
    treeName: string,
    row: number,
    col: number
  ): void {
    this.editing.update(() => {
      const newTree = structuredClone(this.editing());

      let oldTraitValue: ITraitTreeRowTrait | undefined;
      let oldTraitRow = -1;
      let oldTraitCol = -1;

      newTree.data.trees[treeName].tree.forEach((traitRow, ri) => {
        traitRow.traits.forEach((trait, ci) => {
          if (trait.name !== $event || (ci === col && ri === row)) return;

          oldTraitValue = trait;
          oldTraitCol = ci;
          oldTraitRow = ri;
        });
      });

      if (oldTraitValue) {
        const curTraitValue = tree[row].traits[col];

        newTree.data.trees[treeName].tree[row].traits[col] = oldTraitValue;
        newTree.data.trees[treeName].tree[oldTraitRow].traits[oldTraitCol] =
          curTraitValue;
      } else {
        newTree.data.trees[treeName].tree[row].traits[col].name = $event ?? '';
        newTree.data.trees[treeName].tree[row].traits[col].maxLevel = 1;
        newTree.data.trees[treeName].tree[row].traits[col].requires = '';
      }

      return newTree;
    });
  }

  public doSave() {
    this.isSaving.set(true);

    setTimeout(() => {
      const item = this.editing();

      this.editing.set(item);

      super.doSave();
    }, 50);
  }
}
