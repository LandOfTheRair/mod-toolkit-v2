import {
  Component,
  computed,
  inject,
  input,
  model,
  OnInit,
  output,
} from '@angular/core';
import { sortBy } from 'lodash';
import { IAchievement } from '../../../../interfaces';
import { ModService } from '../../../services/mod.service';

@Component({
  selector: 'app-input-achievement',
  standalone: false,
  templateUrl: './input-achievement.component.html',
  styleUrl: './input-achievement.component.scss',
})
export class InputAchievementComponent implements OnInit {
  private modService = inject(ModService);

  public achievement = model<IAchievement | undefined>();
  public label = input<string>('Achievement');
  public defaultValue = input<string>();
  public change = output<string>();

  public values = computed(() => {
    const mod = this.modService.mod();
    const activeDependencies = this.modService.activeDependencies();

    const myModAchievements = mod.achievements.map((i) => ({
      category: `${mod.meta.name} (Current)`,
      data: i,
      desc: i.desc,
      value: i.name,
      index: 0,
    }));

    const depAchievements = activeDependencies
      .map((dep, idx) =>
        dep.achievements.map((i) => ({
          category: dep.meta.name,
          data: i,
          desc: i.desc,
          value: i.name,
          index: idx + 1,
        })),
      )
      .flat();

    return [
      ...sortBy([...myModAchievements, ...depAchievements], ['index', 'value']),
    ];
  });

  ngOnInit() {
    const defaultItem = this.defaultValue();
    if (defaultItem) {
      const foundItem = this.values().find((i) => i.value === defaultItem);

      setTimeout(() => {
        this.achievement.set(foundItem as unknown as IAchievement);
      }, 50);
    }
  }
}
