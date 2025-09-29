import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ModService } from '../../../services/mod.service';

@Component({
  selector: 'app-input-sprite',
  templateUrl: './input-sprite.component.html',
  styleUrl: './input-sprite.component.scss',
})
export class InputSpriteComponent {
  private modService = inject(ModService);

  public sprite = model.required<number>();
  public type = input<'creatures' | 'items'>('items');
  public step = computed(() => (this.type() === 'creatures' ? 5 : 1));

  public usedSprites = computed(() => {
    const mod = this.modService.mod();
    const sprites: number[] = [];
    if (this.type() === 'items') {
      sprites.push(...mod.items.map((i) => i.sprite));
    } else {
      sprites.push(...mod.npcs.flatMap((n) => n.sprite));
    }

    return sprites.reduce((acc, sprite) => {
      return {
        ...acc,
        [sprite]: (acc[sprite] ?? 0) + 1,
      };
    }, {} as Record<number, number>);
  });

  public pickerSprite = signal<number>(0);

  public iconPicker = viewChild<ElementRef<HTMLDialogElement>>('iconPicker');

  public readonly maxSpriteCount = {
    items: 1074,
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
