import { Emitter } from "../../emitters/emitter";
import { TagImplOptions, TagToken, Context } from "../../types";
import { Tokenizer } from "../../parser/tokenizer";

export default {
  parse(token: TagToken) {
    const tokenizer = new Tokenizer(token.args, this.picx.options.operatorsTrie);
    const tokens = tokenizer.readPicxTagTokens(this.picx.options);
    this.tpls = this.picx.parser.parseTokens(tokens);
  },
  *render(ctx: Context, emitter: Emitter): Generator<unknown, void, unknown> {
    yield this.picx.renderer.renderTemplates(this.tpls, ctx, emitter);
  }
} as TagImplOptions;
