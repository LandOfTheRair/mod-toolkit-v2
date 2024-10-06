import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class URLService {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public trackURLChanges(params: any) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams: params,
    });
  }
}
