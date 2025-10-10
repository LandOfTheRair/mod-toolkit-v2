import { Component, computed, OnInit, signal } from '@angular/core';
import { CodeModel } from '@ngstack/code-editor';
import * as yaml from 'js-yaml';

import { ICoreContent } from '../../../../interfaces';
import { EditorBaseComponent } from '../../../shared/components/editor-base/editor-base.component';

@Component({
    selector: 'app-cores-editor',
    templateUrl: './cores-editor.component.html',
    styleUrl: './cores-editor.component.scss',
    standalone: false
})
export class CoresEditorComponent
  extends EditorBaseComponent<ICoreContent>
  implements OnInit
{
  public currentItem = signal<ICoreContent | undefined>(undefined);

  public canSave = computed(() => {
    const data = this.editing();
    return (
      data.name && this.yamlText() && !this.yamlError() && !this.isSaving()
    );
  });

  public satisfiesUnique = computed(() => {
    const data = this.editing();
    return !this.modService.doesExistDuplicate<ICoreContent>(
      'cores',
      'name',
      data.name,
      data._id
    );
  });

  public yamlText = signal<string>('');

  public yamlError = computed(() => {
    const text = this.yamlText();
    try {
      yaml.load(text);
    } catch (e: unknown) {
      return (e as Error).message;
    }
  });

  public readonly fileModel: CodeModel = {
    language: 'yaml',
    uri: 'code.yml',
    value: '',
  };

  ngOnInit(): void {
    const core = this.editing();

    if (core.yaml) {
      this.yamlText.set(core.yaml);
      this.fileModel.value = this.yamlText();
    }

    super.ngOnInit();
  }

  public onYamlChanged(newYaml: string) {
    this.yamlText.set(newYaml);
  }

  doSave() {
    this.isSaving.set(true);

    setTimeout(() => {
      const core = this.editing();

      core.yaml = this.yamlText();
      core.json = yaml.load(this.yamlText());

      this.editing.set(core);

      super.doSave();
    }, 50);
  }
}
