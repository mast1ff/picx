import { Picx, normalizeDirectoryList } from "picx";

export function expressHandler(picx: Picx) {
  let firstCall = true;

  return function (this: any, filePath: string, ctx: object, callback: (err: Error | null, rendered: string) => void) {
    if (firstCall) {
      firstCall = false;
      const dirs = normalizeDirectoryList(this.root);
      picx.options.root.unshift(...dirs);
      picx.options.layouts.unshift(...dirs);
      picx.options.partials.unshift(...dirs);
    }
    picx.renderFile(filePath, ctx).then((html) => callback(null, html) as any, callback as any);
  };
}
