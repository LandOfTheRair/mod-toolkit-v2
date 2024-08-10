import { Component, computed, input, model } from '@angular/core';

@Component({
  selector: 'app-input-sprite',
  templateUrl: './input-sprite.component.html',
  styleUrl: './input-sprite.component.scss',
})
export class InputSpriteComponent {
  public sprite = model.required<number>();
  public type = input<'creatures' | 'items'>('items');
  public step = computed(() => (this.type() === 'creatures' ? 5 : 1));
}
