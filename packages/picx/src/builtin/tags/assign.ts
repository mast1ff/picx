import { Value, Tokenizer, assert, TagImplOptions, TagToken, Context } from "../../types";

export default {
  parse(token: TagToken) {
    const tokenizer = new Tokenizer(token.args, this.picx.options.operatorsTrie);
    this.key = tokenizer.readIdentifier().content;
    tokenizer.skipBlank();
    assert(tokenizer.peek() === "=", () => `illegal token ${token.getText()}`);
    tokenizer.advance();
    this.value = new Value(tokenizer.remaining(), this.picx);
  },
  *render(ctx: Context): Generator<unknown, void, unknown> {
    ctx.bottom()[this.key] = yield this.value.value(ctx, this.picx.options.lenientIf);
  }
} as TagImplOptions;
