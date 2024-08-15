import { IModKit } from '../../../interfaces';
import { id } from '../id';

export function ensureIds(mod: IModKit) {
  Object.keys(mod).forEach((modKey) => {
    if (modKey === 'meta') return;

    mod[modKey as keyof Omit<IModKit, 'meta'>].forEach((data) => {
      data._id ??= id();
    });
  });
}
