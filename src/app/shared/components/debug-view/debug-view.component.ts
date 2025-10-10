import { Component, inject } from '@angular/core';
import { DebugService } from '../../../services/debug.service';

@Component({
    selector: 'app-debug-view',
    templateUrl: './debug-view.component.html',
    styleUrl: './debug-view.component.scss',
    standalone: false
})
export class DebugViewComponent {
  public debugService = inject(DebugService);
}
