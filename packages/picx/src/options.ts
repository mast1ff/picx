import { snakeCase, forOwn, isArray, isString, isFunction } from "./util/underscore";
import { PicxCache } from "./cache/cache";
import { LRU } from "./cache/lru";
import { FS } from "./fs/fs";
import * as fs from "./fs/node";
import { defaultOperators, Operators } from "./render/operator";
import { createTrie, Trie } from "./util/operator-trie";
import * as builtinFilters from "./builtin/filters";
import { assert, FilterImplOptions } from "./types";

const filters = new Map();
forOwn(builtinFilters, (conf: FilterImplOptions, name: string) => {
  filters.set(snakeCase(name), conf);
});

type OutputEscape = (value: any) => string;
type OutputEscapeOption = "escape" | "json" | OutputEscape;

export interface PicxOptions {
  /** A directory or an array of directories from where to resolve layout and include templates, and the filename passed to `.renderFile()`. If it's an array, the files are looked up in the order they occur in the array. Defaults to `["."]` */
  root?: string | string[];
  /** A directory or an array of directories from where to resolve included templates. If it's an array, the files are looked up in the order they occur in the array. Defaults to `root` */
  partials?: string | string[];
  /** A directory or an array of directories from where to resolve layout templates. If it's an array, the files are looked up in the order they occur in the array. Defaults to `root` */
  layouts?: string | string[];
  /** Allow refer to layouts/partials by relative pathname. To avoid arbitrary filesystem read, paths been referenced also need to be within corresponding root, partials, layouts. Defaults to `true`. */
  relativeReference?: boolean;
  /** Use jekyll style include, pass parameters to `include` variable of current scope. Defaults to `false`. */
  jekyllInclude?: boolean;
  /** Add a extname (if filepath doesn't include one) before template file lookup. Eg: setting to `".html"` will allow including file by basename. Defaults to `""`. */
  extname?: string;
  /** Whether or not to cache resolved templates. Defaults to `false`. */
  cache?: boolean | number | PicxCache;
  /** Use Javascript Truthiness. Defaults to `false`. */
  jsTruthy?: boolean;
  /** If set, treat the `filepath` parameter in `{%include filepath %}` and `{%layout filepath%}` as a variable, otherwise as a literal value. Defaults to `true`. */
  dynamicPartials?: boolean;
  /** Whether or not to assert tag existence. If set to `false`, undefined tags will be skipped and render comment. Otherwise, undefined tags will cause an exception. Defaults to `false`. */
  strictTags?: boolean;
  /** Whether or not to assert filter existence. If set to `false`, undefined filters will be skipped. Otherwise, undefined filters will cause an exception. Defaults to `false`. */
  strictFilters?: boolean;
  /** Whether or not to assert variable existence.  If set to `false`, undefined variables will be rendered as empty string.  Otherwise, undefined variables will cause an exception. Defaults to `false`. */
  strictVariables?: boolean;
  /** Hide scope variables from prototypes, useful when you're passing a not sanitized object into Picx or need to hide prototypes from templates. */
  ownPropertyOnly?: boolean;
  /** Modifies the behavior of `strictVariables`. If set, a single undefined variable will *not* cause an exception in the context of the `if`/`elsif`/`unless` tag and the `default` filter. Instead, it will evaluate to `false` and `null`, respectively. Irrelevant if `strictVariables` is not set. Defaults to `false`. **/
  lenientIf?: boolean;
  /** JavaScript timezoneOffset for `date` filter, default to local time. That means if you're in Australia (UTC+10), it'll default to -600 */
  timezoneOffset?: number;
  /** Strip blank characters (including ` `, `\t`, and `\r`) from the right of tags (`{% %}`) until `\n` (inclusive). Defaults to `false`. */
  trimTagRight?: boolean;
  /** Similar to `trimTagRight`, whereas the `\n` is exclusive. Defaults to `false`. See Whitespace Control for details. */
  trimTagLeft?: boolean;
  /** Strip blank characters (including ` `, `\t`, and `\r`) from the right of values (`{{ }}`) until `\n` (inclusive). Defaults to `false`. */
  trimOutputRight?: boolean;
  /** Similar to `trimOutputRight`, whereas the `\n` is exclusive. Defaults to `false`. See Whitespace Control for details. */
  trimOutputLeft?: boolean;
  /** The left delimiter for picx tags. **/
  tagDelimiterLeft?: string;
  /** The right delimiter for picx tags. **/
  tagDelimiterRight?: string;
  /** The left delimiter for picx outputs. **/
  outputDelimiterLeft?: string;
  /** The right delimiter for picx outputs. **/
  outputDelimiterRight?: string;
  /** Whether input strings to date filter preserve the given timezone **/
  preserveTimezones?: boolean;
  /** Whether `trim*Left`/`trim*Right` is greedy. When set to `true`, all consecutive blank characters including `\n` will be trimed regardless of line breaks. Defaults to `true`. */
  greedy?: boolean;
  /** `fs` is used to override the default file-system module with a custom implementation. */
  fs?: FS;
  /** the global scope passed down to all partial and layout templates, i.e. templates included by `include`, `layout` and `render` tags. */
  globals?: object;
  /** Whether or not to keep value type when writing the Output, not working for streamed rendering. Defaults to `false`. */
  keepOutputType?: boolean;
  /** Default escape filter applied to output values, when set, you'll have to add `| raw` for values don't need to be escaped. Defaults to `undefined`. */
  outputEscape?: OutputEscapeOption;
  /** An object of operators for conditional statements. Defaults to the regular Picx operators. */
  operators?: Operators;
  /** Respect parameter order when using filters like "for ... reversed limit", Defaults to `false`. */
  orderedFilterParameters?: boolean;
}

export interface RenderOptions {
  /**
   * This call is sync or async? It's used by picx internal methods, you'll not need this.
   */
  sync?: boolean;
  /**
   * Same as `globals` on PicxOptions, but only for current render() call
   */
  globals?: object;
  /**
   * Same as `strictVariables` on PicxOptions, but only for current render() call
   */
  strictVariables?: boolean;
  /**
   * Same as `ownPropertyOnly` on PicxOptions, but only for current render() call
   */
  ownPropertyOnly?: boolean;
}

interface NormalizedOptions extends PicxOptions {
  root?: string[];
  partials?: string[];
  layouts?: string[];
  cache?: PicxCache;
  outputEscape?: OutputEscape;
  operatorsTrie?: Trie;
}

export interface NormalizedFullOptions extends NormalizedOptions {
  root: string[];
  partials: string[];
  layouts: string[];
  relativeReference: boolean;
  jekyllInclude: boolean;
  extname: string;
  cache?: PicxCache;
  jsTruthy: boolean;
  dynamicPartials: boolean;
  fs: FS;
  strictTags: boolean;
  strictFilters: boolean;
  strictVariables: boolean;
  ownPropertyOnly: boolean;
  lenientIf: boolean;
  trimTagRight: boolean;
  trimTagLeft: boolean;
  trimOutputRight: boolean;
  trimOutputLeft: boolean;
  tagDelimiterLeft: string;
  tagDelimiterRight: string;
  outputDelimiterLeft: string;
  outputDelimiterRight: string;
  preserveTimezones: boolean;
  greedy: boolean;
  globals: object;
  keepOutputType: boolean;
  operators: Operators;
  operatorsTrie: Trie;
}

export const defaultOptions: NormalizedFullOptions = {
  root: ["."],
  layouts: ["."],
  partials: ["."],
  relativeReference: true,
  jekyllInclude: false,
  cache: undefined,
  extname: "",
  fs,
  dynamicPartials: true,
  jsTruthy: false,
  trimTagRight: true,
  trimTagLeft: true,
  trimOutputRight: false,
  trimOutputLeft: false,
  greedy: true,
  tagDelimiterLeft: "<!--",
  tagDelimiterRight: "-->",
  outputDelimiterLeft: "{{",
  outputDelimiterRight: "}}",
  preserveTimezones: false,
  strictTags: false,
  strictFilters: false,
  strictVariables: false,
  ownPropertyOnly: false,
  lenientIf: false,
  globals: {},
  keepOutputType: false,
  operators: defaultOperators,
  operatorsTrie: createTrie(defaultOperators)
};

export function normalize(options: PicxOptions): NormalizedFullOptions {
  if (options.hasOwnProperty("operators")) {
    (options as NormalizedOptions).operatorsTrie = createTrie(options.operators!);
  }
  if (options.hasOwnProperty("root")) {
    if (!options.hasOwnProperty("partials")) options.partials = options.root;
    if (!options.hasOwnProperty("layouts")) options.layouts = options.root;
  }
  if (options.hasOwnProperty("cache")) {
    let cache: PicxCache | undefined;
    if (typeof options.cache === "number") cache = options.cache > 0 ? new LRU(options.cache) : undefined;
    else if (typeof options.cache === "object") cache = options.cache;
    else cache = options.cache ? new LRU(1024) : undefined;
    options.cache = cache;
  }
  options = { ...defaultOptions, ...(options.jekyllInclude ? { dynamicPartials: false } : {}), ...options };
  if (!options.fs!.dirname && options.relativeReference) {
    console.warn(
      "[Picx] `fs.dirname` is required for relativeReference, set relativeReference to `false` to suppress this warning, or provide implementation for `fs.dirname`"
    );
    options.relativeReference = false;
  }
  options.root = normalizeDirectoryList(options.root);
  options.partials = normalizeDirectoryList(options.partials);
  options.layouts = normalizeDirectoryList(options.layouts);
  options.outputEscape = options.outputEscape && getOutputEscapeFunction(options.outputEscape);
  return options as NormalizedFullOptions;
}

function getOutputEscapeFunction(nameOrFunction: OutputEscapeOption) {
  if (isString(nameOrFunction)) {
    const filterImpl = filters.get(nameOrFunction);
    assert(isFunction(filterImpl), `filter "${nameOrFunction}" not found`);
    return filterImpl;
  }
  assert(isFunction(nameOrFunction), "`outputEscape` need to be of type string or function");
  return nameOrFunction;
}

export function normalizeDirectoryList(value: any): string[] {
  let list: string[] = [];
  if (isArray(value)) list = value;
  if (isString(value)) list = [value];
  return list;
}