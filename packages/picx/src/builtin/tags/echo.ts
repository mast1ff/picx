import { Value } from "../../template/value";
import { Emitter } from "../../emitters/emitter";
import { TagImplOptions, TagToken, Context } from "../../types";

export default {
  parse(token: TagToken) {
    this.value = new Value(token.args, this.picx);
  },
  *render(ctx: Context, emitter: Emitter): Generator<unknown, void, unknown> {
    const val = yield this.value.value(ctx, false);
    emitter.write(val);
  }
} as TagImplOptions;
