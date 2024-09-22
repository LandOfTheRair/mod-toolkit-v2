import { Component, inject, output, signal } from '@angular/core';
import { CodeModel } from '@ngstack/code-editor';
import * as alasql from 'alasql';
import * as _ from 'lodash';
import { LocalStorageService } from 'ngx-webstorage';

import { id } from '../helpers';
import { QueryService } from '../services/query.service';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrl: './query.component.scss',
})
export class QueryComponent {
  public exit = output();

  private localStorage = inject(LocalStorageService);

  public queryService = inject(QueryService);

  public activeQueryTab = signal<number>(0);

  public jsResult = signal<any>(undefined);
  public jsError = signal<string>('');

  public sqlResult = signal<any>(undefined);
  public sqlError = signal<string>('');

  public tabOrder = [
    {
      name: 'JavaScript',
    },
    {
      name: 'SQL',
    },
  ];

  public readonly jsModel: CodeModel = {
    language: 'javascript',
    uri: 'query.js',
    value: 'function query(mod, dangerModModifiable) {\n\n}',
  };

  public readonly sqlModel: CodeModel = {
    language: 'sql',
    uri: 'query.sql',
    value: 'SELECT type, COUNT(type) from ? GROUP BY type;',
  };

  constructor() {
    (window as any)._ = _;
    (window as any).id = id;

    const lastQueryTab =
      (this.localStorage.retrieve('lastquerytab') as number) ?? 0;
    this.activeQueryTab.set(lastQueryTab);

    const oldJSString = this.localStorage.retrieve('jsfunc');
    if (oldJSString) {
      this.jsModel.value = oldJSString;
    }

    const oldSQLString = this.localStorage.retrieve('sqlfunc');
    if (oldSQLString) {
      this.sqlModel.value = oldSQLString;
    }
  }

  public changeTab(newTab: number) {
    this.activeQueryTab.set(newTab);
    this.localStorage.store('lastquerytab', newTab);
  }

  public onJSChanged($event: string) {
    this.localStorage.store('jsfunc', $event);
  }

  public updateJSFunction() {
    this.jsResult.set(undefined);
    this.jsError.set('');

    try {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const func = new Function(`return ${this.jsModel.value};`);
      const modifiableMod = this.queryService.modForJSModifiable();
      const result = func()(this.queryService.modForJS(), modifiableMod);
      this.queryService.updateMod(modifiableMod);
      this.jsResult.set(result);
    } catch (e: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.jsError.set(e?.message ?? 'JS parsing error');
    }
  }

  public onSQLChanged($event: string) {
    this.localStorage.store('sqlfunc', $event);
  }

  public updateSQLFunction() {
    this.sqlResult.set(undefined);
    this.sqlError.set('');

    try {
      const result = alasql(this.sqlModel.value, [
        this.queryService.modForSQL(),
      ]);
      this.sqlResult.set(result);
    } catch (e: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.sqlError.set(e?.message ?? 'SQL parsing error');
    }
  }
}
