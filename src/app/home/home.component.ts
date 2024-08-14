import {
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { LocalStorageService } from 'ngx-webstorage';
import { numErrorsForMod } from '../helpers';
import { DebugService } from '../services/debug.service';
import { ElectronService } from '../services/electron.service';
import { ModService } from '../services/mod.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private localStorage = inject(LocalStorageService);
  public debugService = inject(DebugService);
  public electronService = inject(ElectronService);
  public modService = inject(ModService);

  public exportWarnSwal = viewChild<SwalComponent>('exportWarnSwal');
  public menuRef = viewChild<ElementRef<HTMLElement>>('menu');

  public activeTab = signal<number>(0);
  public isValidating = signal<boolean>(false);

  public tabOrder = [
    { name: 'Maps', count: computed(() => this.modService.mod().maps.length) },
    {
      name: 'Items',
      count: computed(() => this.modService.mod().items.length),
    },
    { name: 'NPCs', count: computed(() => this.modService.mod().npcs.length) },
    {
      name: 'Droptables',
      count: computed(() => this.modService.mod().drops.length),
    },
    {
      name: 'Recipes',
      count: computed(() => this.modService.mod().recipes.length),
    },
    {
      name: 'Spawners',
      count: computed(() => this.modService.mod().spawners.length),
    },
    {
      name: 'NPC Scripts/Dialogs',
      count: computed(() => this.modService.mod().dialogs.length),
    },
    {
      name: 'Quests',
      count: computed(() => this.modService.mod().quests.length),
    },
  ];

  constructor() {
    const lastTab = (this.localStorage.retrieve('lasttab') as number) ?? 0;
    this.activeTab.set(lastTab);
  }

  changeTab(newTab: number) {
    this.activeTab.set(newTab);

    this.localStorage.store('lasttab', newTab);
  }

  closeMenu() {
    this.menuRef()?.nativeElement.attributes.removeNamedItem('open');
  }

  async attemptExport() {
    const saveMod = () => {
      this.electronService.send('SAVE_MOD', {
        shouldExport: true,
        modData: this.modService.mod(),
      });
    };

    const numErrors = numErrorsForMod(this.modService.mod());
    if (numErrors > 0) {
      const res = await this.exportWarnSwal()?.fire();
      if (!res) return;

      const { isConfirmed, isDenied } = res;

      if (isDenied) {
        this.isValidating.set(true);
        return;
      }

      if (isConfirmed) {
        saveMod();
        return;
      }
    }

    saveMod();
  }

  toggleModValidation() {
    this.isValidating.set(!this.isValidating());
  }
}
