import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DialogNodeEditorService {
  public addCheckPassAction$ = new Subject<{ nodePath: string }>();
  public removeCheckPassAction$ = new Subject<{
    nodePath: string;
    index: number;
  }>();

  public addCheckFailAction$ = new Subject<{ nodePath: string }>();
  public removeCheckFailAction$ = new Subject<{
    nodePath: string;
    index: number;
  }>();

  public addQuestCompleteAction$ = new Subject<{ nodePath: string }>();
  public removeQuestCompleteAction$ = new Subject<{
    nodePath: string;
    index: number;
  }>();
}
