import { Component, inject, input, OnInit, output } from '@angular/core';
import { PinpointService } from '../services/pinpoint.service';

@Component({
  selector: 'app-pinpoint',
  templateUrl: './pinpoint.component.html',
  styleUrl: './pinpoint.component.scss',
})
export class PinpointComponent implements OnInit {
  public exit = output();
  public changeURLProp = output<[string, string]>();

  public defaultTab = input<string | null>();
  public defaultMap = input<string | null>();
  public defaultItem = input<string | null>();
  public defaultNPC = input<string | null>();
  public defaultSTEM = input<string | null>();

  public pinpointService = inject(PinpointService);

  public tabOrder = [
    {
      name: 'Map',
    },
    {
      name: 'Item',
    },
    {
      name: 'NPC',
    },
    {
      name: 'STEM',
    },
  ];

  ngOnInit() {
    const defaultTab = this.defaultTab();
    const defaultMap = this.defaultMap();
    const defaultItem = this.defaultItem();
    const defaultNPC = this.defaultNPC();
    const defaultSTEM = this.defaultSTEM();

    if (defaultTab) {
      this.pinpointService.activePinpointTab.set(+defaultTab);
    }

    if (defaultMap) {
      this.pinpointService.searchMap(defaultMap);
    }

    if (defaultItem) {
      this.pinpointService.searchItem(defaultItem);
    }

    if (defaultNPC) {
      this.pinpointService.searchNPC(defaultNPC);
    }

    if (defaultSTEM) {
      this.pinpointService.searchSTEM(defaultSTEM);
    }
  }
}
