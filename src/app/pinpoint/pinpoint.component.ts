import { Component, inject, OnInit, output } from '@angular/core';
import { linkedQueryParam } from 'ngxtension/linked-query-param';
import { PinpointService } from '../services/pinpoint.service';

@Component({
  selector: 'app-pinpoint',
  templateUrl: './pinpoint.component.html',
  styleUrl: './pinpoint.component.scss',
  standalone: false,
})
export class PinpointComponent implements OnInit {
  public exit = output();

  public defaultMap = linkedQueryParam<string | undefined>('ppmap');
  public defaultItem = linkedQueryParam<string | undefined>('ppitem');
  public defaultNPC = linkedQueryParam<string | undefined>('ppnpc');
  public defaultSTEM = linkedQueryParam<string | undefined>('ppstem');

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
    const defaultTab = this.pinpointService.activePinpointTab();
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

  public leaveSection() {
    this.pinpointService.activePinpointTab.set(undefined);
    this.defaultMap.set(undefined);
    this.defaultItem.set(undefined);
    this.defaultNPC.set(undefined);
    this.defaultSTEM.set(undefined);

    this.exit.emit();
  }
}
