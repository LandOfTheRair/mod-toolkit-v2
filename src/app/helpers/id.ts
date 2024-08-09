import { v7 as uuid } from 'uuid';

export function id(): string {
  return uuid() as string;
}
