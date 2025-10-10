import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ModService } from '../../../services/mod.service';

@Component({
    selector: 'app-input-icon',
    templateUrl: './input-icon.component.html',
    styleUrl: './input-icon.component.scss',
    standalone: false
})
export class InputIconComponent {
  private modService = inject(ModService);

  public icon = model.required<string | undefined>();
  public color = input<string>();
  public bgColor = input<string>();
  public borderColor = input<string>();

  public change = output<string>();

  public label = input<string>('Icon');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  public values = computed(() => this.modService.json()['macicons']);

  public pickerIcon = signal<string | undefined>('');

  public iconPicker = viewChild<ElementRef<HTMLDialogElement>>('iconPicker');

  isModalOpen() {
    return this.iconPicker()?.nativeElement.hasAttribute('open');
  }

  changeIcon() {
    this.pickerIcon.set(this.icon());
    this.iconPicker()?.nativeElement.showModal();
  }

  confirmNewIcon(newIcon: string | undefined) {
    this.icon.set(newIcon);
  }
}
