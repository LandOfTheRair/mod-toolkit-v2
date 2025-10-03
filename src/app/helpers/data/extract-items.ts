/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { BaseClassType, INPCScript } from '../../../interfaces';

export function getAllNodesFromDialog(dialogEntry: any): any[] {
  const nodes = [dialogEntry];

  if (dialogEntry.checkFailActions)
    nodes.push(
      ...dialogEntry.checkFailActions.map((a: any) => getAllNodesFromDialog(a)),
    );

  if (dialogEntry.checkPassActions)
    nodes.push(
      ...dialogEntry.checkPassActions.map((a: any) => getAllNodesFromDialog(a)),
    );

  return nodes.flat(Infinity);
}

export function getAllDialogActions(dialog: INPCScript): any[] {
  return Object.keys(dialog.dialog ?? {})
    .flatMap((k) =>
      Object.keys(dialog.dialog[k] ?? {}).map(
        (d) => dialog.dialog[k][d]?.actions ?? [],
      ),
    )
    .flat()
    .map((a: any) => getAllNodesFromDialog(a))
    .flat(Infinity);
}

export function extractAllItemsFromDialog(
  dialog: INPCScript,
  validClasses: BaseClassType[],
): string[] {
  const allDialogWords = getAllDialogActions(dialog);

  const allDialogItemNames = allDialogWords
    .filter((i) => i.item)
    .map((i) => i.item.name)
    .filter(Boolean);

  const allDialogItemUpgrades = allDialogWords
    .filter((i) => i.upgrade)
    .map((i) => i.upgrade)
    .filter(Boolean);

  return [...allDialogItemNames, ...allDialogItemUpgrades]
    .map((i) => {
      if (i.includes('${ baseClass }')) {
        return validClasses.map((c) => i.split('${ baseClass }').join(c));
      }

      return i;
    })
    .flat();
}

export function extractAllItemsFromBehavior(dialog: INPCScript): string[] {
  const allDialogItems = (dialog.behaviors ?? [])
    .flatMap((b) => [
      ...(b.dailyVendorItems ?? []).map((i) => i.item),
      ...(b.vendorItems ?? []).map((i) => i.item),
    ])
    .filter(Boolean);

  return allDialogItems;
}
