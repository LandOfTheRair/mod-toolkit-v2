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
import { numErrorsForMod, validationMessagesForMod } from '../helpers';
import { formatMod } from '../helpers/exporter';
import { AnalysisService } from '../services/analysis.service';
import { DebugService } from '../services/debug.service';
import { ElectronService } from '../services/electron.service';
import { ModService } from '../services/mod.service';
import { PinpointService } from '../services/pinpoint.service';
import { QueryService } from '../services/query.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private localStorage = inject(LocalStorageService);
  public pinpointService = inject(PinpointService);
  public analysisService = inject(AnalysisService);
  public queryService = inject(QueryService);
  public debugService = inject(DebugService);
  public electronService = inject(ElectronService);
  public modService = inject(ModService);

  public exportWarnSwal = viewChild<SwalComponent>('exportWarnSwal');
  public menuRef = viewChild<ElementRef<HTMLElement>>('menu');
  public tester = viewChild<ElementRef<HTMLDialogElement>>('tester');

  public activeTab = signal<number>(0);
  public isValidating = signal<boolean>(false);

  public hasErrors = computed(() => {
    const mod = this.modService.mod();
    const classes = this.modService.availableClasses();
    const json = this.modService.json();

    if (json.sfx.length === 0 || json.bgm.length === 0 || classes.length === 0)
      return false;

    return (
      validationMessagesForMod(mod, classes, json).filter((m) =>
        m.messages.some((t) => t.type === 'error')
      ).length > 0
    );
  });

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
      name: 'NPC Scripts',
      count: computed(() => this.modService.mod().dialogs.length),
    },
    {
      name: 'Quests',
      count: computed(() => this.modService.mod().quests.length),
    },
    {
      name: 'Cores',
      count: computed(() => this.modService.mod().cores.length),
    },
    {
      name: 'STEMs',
      count: computed(() => this.modService.mod().stems.length),
    },
    {
      name: 'Trait Trees',
      count: computed(() => this.modService.mod().traitTrees.length),
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
        modData: formatMod(this.modService.mod()),
      });
    };

    const numErrors = numErrorsForMod(
      this.modService.mod(),
      this.modService.availableClasses(),
      this.modService.json()
    );
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
    this.pinpointService.togglePinpointing(false);
    this.analysisService.toggleAnalyzing(false);
    this.queryService.toggleQuerying(false);
  }

  togglePinpointing() {
    this.pinpointService.togglePinpointing(true);
    this.isValidating.set(false);
    this.analysisService.toggleAnalyzing(false);
    this.queryService.toggleQuerying(false);
  }

  toggleAnalyzing() {
    this.analysisService.toggleAnalyzing(true);
    this.isValidating.set(false);
    this.pinpointService.togglePinpointing(false);
    this.queryService.toggleQuerying(false);
  }

  toggleQuerying() {
    this.queryService.toggleQuerying(true);
    this.isValidating.set(false);
    this.pinpointService.togglePinpointing(false);
    this.analysisService.toggleAnalyzing(false);
  }

  toggleTester() {
    this.tester()?.nativeElement.showModal();
  }
}
