import { inject, Injectable } from '@angular/core';
import { HotToastService, ToastPosition } from '@ngxpert/hot-toast';

const toastOptions = () => ({
  position: 'bottom-right' as ToastPosition,
  dismissible: true,
});

@Injectable({
  providedIn: 'root',
})
export class NotifyService {
  private toastService = inject(HotToastService);

  info({ message }: { message: string }) {
    this.toastService.info(message, toastOptions());
  }

  error({ message }: { message: string }) {
    this.toastService.error(message, toastOptions());
  }

  success({ message }: { message: string }) {
    this.toastService.success(message, toastOptions());
  }

  warning({ message }: { message: string }) {
    this.toastService.success(message, toastOptions());
  }
}
