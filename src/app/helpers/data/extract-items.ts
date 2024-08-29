/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { BaseClassType, INPCScript } from '../../../interfaces';

export function getAllNodesFromDialog(dialogEntry: any): any[] {
  const nodes = [dialogEntry];

  if (dialogEntry.checkFailActions)
    nodes.push(
      ...dialogEntry.checkFailActions.map((a: any) => getAllNodesFromDialog(a))
    );

  if (dialogEntry.checkPassActions)
    nodes.push(
      ...dialogEntry.checkPassActions.map((a: any) => getAllNodesFromDialog(a))
    );

  return nodes.flat(Infinity);
}

export function extractAllItemsFromDialog(
  dialog: INPCScript,
  validClasses: BaseClassType[]
): string[] {
  const allDialogWords = Object.keys(dialog.dialog ?? {})
    .flatMap((k) =>
      Object.keys(dialog.dialog[k] ?? {}).map(
        (d) => dialog.dialog[k][d].actions
      )
    )
    .flat()
    .map((a: any) => getAllNodesFromDialog(a))
    .flat(Infinity);

  const allDialogItemNames = allDialogWords
    .filter((i) => i.item)
    .map((i) => i.item.name)
    .filter(Boolean);

  return allDialogItemNames
    .map((i) => {
      if (i.includes('${ baseClass }')) {
        return validClasses.map((c) => i.split('${ baseClass }').join(c));
      }

      return i;
    })
    .flat();
}
