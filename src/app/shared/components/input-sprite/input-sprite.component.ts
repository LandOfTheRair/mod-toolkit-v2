import {
  Component,
  computed,
  ElementRef,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-input-sprite',
  templateUrl: './input-sprite.component.html',
  styleUrl: './input-sprite.component.scss',
})
export class InputSpriteComponent {
  public sprite = model.required<number>();
  public type = input<'creatures' | 'items'>('items');
  public step = computed(() => (this.type() === 'creatures' ? 5 : 1));

  public pickerSprite = signal<number>(0);

  public iconPicker = viewChild<ElementRef<HTMLDialogElement>>('iconPicker');

  public readonly maxSpriteCount = {
    items: 1059,
    creatures: 1875,
  };

  public iconArray = computed(() =>
    Array(this.maxSpriteCount[this.type()])
      .fill(0)
      .map((_, i) => i)
      .filter((i) => i % this.step() === 0)
  );

  changeIcon() {
    this.pickerSprite.set(this.sprite());
    this.iconPicker()?.nativeElement.showModal();
  }

  confirmNewIcon(newIcon: number) {
    this.sprite.set(newIcon);
  }
}
