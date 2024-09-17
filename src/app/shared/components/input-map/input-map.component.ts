import {
  Component,
  computed,
  inject,
  input,
  model,
  OnInit,
  output,
} from '@angular/core';
import { uniq } from 'lodash';
import { ModService } from '../../../services/mod.service';

@Component({
  selector: 'app-input-map',
  templateUrl: './input-map.component.html',
  styleUrl: './input-map.component.scss',
})
export class InputMapComponent implements OnInit {
  private modService = inject(ModService);

  public map = model.required<string | undefined>();
  public defaultValue = input<string>();
  public change = output<string>();

  public values = computed(() =>
    uniq(this.modService.mod().maps.map((m) => m.name)).sort()
  );

  ngOnInit() {
    this.map.set(this.values().find((f) => f === this.defaultValue()));
  }
}
