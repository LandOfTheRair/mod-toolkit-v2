import { Component, ElementRef, model, OnInit, viewChild } from '@angular/core';
import { createJSONEditor } from 'vanilla-jsoneditor';

@Component({
  selector: 'app-input-json',
  standalone: false,
  templateUrl: './input-json.component.html',
  styleUrl: './input-json.component.scss',
})
export class InputJsonComponent implements OnInit {
  public json = model.required<any>();

  public jsonEditor = viewChild<ElementRef<HTMLDivElement>>('jsonEditor');

  ngOnInit() {
    const jsonEditor = this.jsonEditor();
    if (!jsonEditor) return;

    const updateJSON = (updated: any) => {
      if (updated.text) {
        try {
          this.json.set(JSON.parse(updated.text as string));
        } catch {}
        return;
      }

      if (updated.json) {
        this.json.set(updated.json);
        return;
      }
    };

    createJSONEditor({
      target: jsonEditor.nativeElement,
      props: {
        content: {
          json: this.json(),
        },
        onChange: updateJSON,
      },
    });
  }
}
