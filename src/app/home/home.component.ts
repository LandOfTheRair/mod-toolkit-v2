import {
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { isUndefined } from 'lodash';
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
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

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
    {
      name: 'Maps',
      count: computed(() => this.modService.mod().maps.length),
      disableOutsideElectron: true,
    },
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

  constructor() {}

  ngOnInit() {
    const lastTab = (this.localStorage.retrieve('lasttab') as number) ?? 0;
    const lastTabUrl = this.route.snapshot.queryParamMap.get('tab');

    this.activeTab.set(lastTabUrl ? +lastTabUrl : lastTab);

    const lastSub = this.route.snapshot.queryParamMap.get('sub');
    switch (lastSub) {
      case 'validate': {
        return this.toggleModValidation();
      }
      case 'pinpoint': {
        return this.togglePinpointing();
      }
      case 'analyze': {
        return this.toggleAnalyzing();
      }
      case 'query': {
        return this.toggleQuerying();
      }
    }
  }

  changeTab(newTab: number) {
    this.activeTab.set(newTab);

    this.localStorage.store('lasttab', newTab);

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams: {
        tab: newTab,
        sub: '',
      },
    });
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

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams: {
        sub: 'validate',
      },
    });
  }

  togglePinpointing() {
    this.pinpointService.togglePinpointing(true);
    this.isValidating.set(false);
    this.analysisService.toggleAnalyzing(false);
    this.queryService.toggleQuerying(false);

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams: {
        sub: 'pinpoint',
      },
    });
  }

  toggleAnalyzing() {
    this.analysisService.toggleAnalyzing(true);
    this.isValidating.set(false);
    this.pinpointService.togglePinpointing(false);
    this.queryService.toggleQuerying(false);

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams: {
        sub: 'analyze',
      },
    });
  }

  toggleQuerying() {
    this.queryService.toggleQuerying(true);
    this.isValidating.set(false);
    this.pinpointService.togglePinpointing(false);
    this.analysisService.toggleAnalyzing(false);

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams: {
        sub: 'query',
      },
    });
  }

  toggleTester() {
    this.tester()?.nativeElement.showModal();
  }

  updateResources() {
    if (this.electronService.isInElectron()) {
      this.electronService.send('UPDATE_RESOURCES');
      return;
    }

    void this.electronService.reloadExternalWebMod();
  }

  getURLSubProp(prop: string): string | null {
    return this.route.snapshot.queryParamMap.get(prop);
  }

  updateSubURLProp(prop: string, value: string | number | undefined) {
    if (isUndefined(value)) return;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams: {
        [prop]: value,
      },
    });
  }

  resetSub() {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        tab: this.activeTab(),
      },
    });
  }
}
