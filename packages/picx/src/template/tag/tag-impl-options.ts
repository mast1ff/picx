import { Context } from "../../context/context";
import { TagToken } from "../../tokens/tag-token";
import { TopLevelToken } from "../../tokens/toplevel-token";
import { HashValue } from "../../template/tag/hash";
import { Emitter } from "../../emitters/emitter";
import { TagImpl } from "./tag-impl";

export interface TagImplOptions {
  parse?: (this: TagImpl, token: TagToken, remainingTokens: TopLevelToken[]) => void;
  render: (
    this: TagImpl,
    ctx: Context,
    emitter: Emitter,
    hash: HashValue
  ) => void | string | Promise<void | string> | Generator<unknown, void | string, unknown>;
}
