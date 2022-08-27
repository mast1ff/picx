import { __assign } from "tslib";
import { Drop } from "../drop/drop";
import { NormalizedFullOptions, defaultOptions, RenderOptions } from "../options";
import { isArray, isNil, isString, isFunction, toPicx } from "../util/underscore";
import { InternalUndefinedVariableError } from "../util/error";
import { Scope } from "./scope";

type PropertyKey = string | number;

export class Context {
  /**
   * insert a Context-level empty scope,
   * for tags like `{% capture %}` `{% assign %}` to operate
   */
  private scopes: Scope[] = [{}];
  private registers = {};
  /**
   * user passed in scope
   * `{% increment %}`, `{% decrement %}` changes this scope,
   * whereas `{% capture %}`, `{% assign %}` only hide this scope
   */
  public environments: Scope;
  /**
   * global scope used as fallback for missing variables
   */
  public globals: Scope;
  public sync: boolean;
  /**
   * The normalized picx options object
   */
  public opts: NormalizedFullOptions;
  /**
   * Throw when accessing undefined variable?
   */
  public strictVariables: boolean;
  public constructor(
    env: object = {},
    opts: NormalizedFullOptions = defaultOptions,
    renderOptions: RenderOptions = {}
  ) {
    this.sync = !!renderOptions.sync;
    this.opts = opts;
    this.globals = renderOptions.globals ?? opts.globals;
    this.environments = env;
    this.strictVariables = renderOptions.strictVariables ?? this.opts.strictVariables;
  }
  public getRegister(key: string) {
    return (this.registers[key] = this.registers[key] || {});
  }
  public setRegister(key: string, value: any) {
    return (this.registers[key] = value);
  }
  public saveRegister(...keys: string[]): [string, any][] {
    return keys.map((key) => [key, this.getRegister(key)]);
  }
  public restoreRegister(keyValues: [string, any][]) {
    return keyValues.forEach(([key, value]) => this.setRegister(key, value));
  }
  public getAll() {
    return [this.globals, this.environments, ...this.scopes].reduce((ctx, val) => __assign(ctx, val), {});
  }
  public get(paths: PropertyKey[]) {
    const scope = this.findScope(paths[0]);
    return this.getFromScope(scope, paths);
  }
  public getFromScope(scope: object, paths: PropertyKey[] | string) {
    if (isString(paths)) paths = paths.split(".");
    return paths.reduce((scope, path, i) => {
      scope = readProperty(scope, path, this.opts.ownPropertyOnly);
      if (isNil(scope) && this.strictVariables) {
        throw new InternalUndefinedVariableError((paths as string[]).slice(0, i + 1).join!("."));
      }
      return scope;
    }, scope);
  }
  public push(ctx: object) {
    return this.scopes.push(ctx);
  }
  public pop() {
    return this.scopes.pop();
  }
  public bottom() {
    return this.scopes[0];
  }
  private findScope(key: string | number) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const candidate = this.scopes[i];
      if (key in candidate) return candidate;
    }
    if (key in this.environments) return this.environments;
    return this.globals;
  }
}

export function readProperty(obj: Scope, key: PropertyKey, ownPropertyOnly: boolean) {
  if (isNil(obj)) return obj;
  obj = toPicx(obj);
  if (isArray(obj) && key < 0) return obj[obj.length + +key];
  const jsProperty = readJSProperty(obj, key, ownPropertyOnly);
  if (jsProperty === undefined && obj instanceof Drop) return obj.methodMissing(key);
  if (isFunction(jsProperty)) return jsProperty.call(obj);
  if (key === "size") return readSize(obj);
  else if (key === "first") return readFirst(obj);
  else if (key === "last") return readLast(obj);
  return jsProperty;
}
export function readJSProperty(obj: Scope, key: PropertyKey, ownPropertyOnly: boolean) {
  if (ownPropertyOnly && !Object.hasOwnProperty.call(obj, key)) return undefined;
  return obj[key];
}

function readFirst(obj: Scope) {
  if (isArray(obj)) return obj[0];
  return obj["first"];
}

function readLast(obj: Scope) {
  if (isArray(obj)) return obj[obj.length - 1];
  return obj["last"];
}

function readSize(obj: Scope) {
  if (obj.hasOwnProperty("size") || obj["size"] !== undefined) return obj["size"];
  if (isArray(obj) || isString(obj)) return obj.length;
  if (typeof obj === "object") return Object.keys(obj).length;
}
