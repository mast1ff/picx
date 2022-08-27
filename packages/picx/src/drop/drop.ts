export abstract class Drop {
  public methodMissing(_key: string | number): Promise<string | undefined> | string | undefined {
    return undefined;
  }
}
