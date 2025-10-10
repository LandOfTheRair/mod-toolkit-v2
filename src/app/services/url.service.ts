import { Injectable } from '@angular/core';
import { linkedQueryParam } from 'ngxtension/linked-query-param';

@Injectable({
  providedIn: 'root',
})
export class URLService {
  public activeTab = linkedQueryParam<number>('tab', {
    parse: (value) => parseInt(value ?? '0', 10),
  });

  public sub = linkedQueryParam<string | undefined>('sub');
  public id = linkedQueryParam<string>('id');
}
