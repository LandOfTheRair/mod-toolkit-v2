import { Component, computed, input } from '@angular/core';

type SpriteType = 'items' | 'creatures';

const divisors: Record<SpriteType, number> = {
  items: 32,
  creatures: 40,
};

@Component({
  selector: 'app-sprite',
  templateUrl: './sprite.component.html',
  styleUrl: './sprite.component.scss',
})
export class SpriteComponent {
  public sprite = input.required<number>();
  public type = input.required<'items' | 'creatures'>();
  public scale = input<number>(1);

  public size = computed(() => divisors[this.type()]);

  public objectPosition = computed(() => {
    const sprite = this.sprite();
    const divisor = this.size();

    const y = Math.floor(sprite / divisor);
    const x = sprite % divisor;
    return `-${x * 64}px -${y * 64}px`;
  });
}
