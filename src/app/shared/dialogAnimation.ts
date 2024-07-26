import { trigger, state, style, transition, animate } from '@angular/animations';

export const dialogAnimation = trigger('dialogAnimation', [
  state('void', style({ opacity: 0, transform: 'scale(0.9)' })),
  state('*', style({ opacity: 1, transform: 'scale(1)' })),
  transition('void <=> *', animate('300ms ease-out')),
]);
