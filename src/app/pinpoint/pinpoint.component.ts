import { Component, inject } from '@angular/core';
import { PinpointService } from '../services/pinpoint.service';

@Component({
  selector: 'app-pinpoint',
  templateUrl: './pinpoint.component.html',
  styleUrl: './pinpoint.component.scss',
})
export class PinpointComponent {
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
      name: 'Spawner',
    },
  ];
}
