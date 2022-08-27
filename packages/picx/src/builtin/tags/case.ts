import {
  toValue,
  evalToken,
  Value,
  Emitter,
  TagToken,
  TopLevelToken,
  Context,
  Template,
  TagImplOptions,
  ParseStream
} from "../../types";
import { Tokenizer } from "../../parser/tokenizer";

export default {
  parse(tagToken: TagToken, remainTokens: TopLevelToken[]) {
    this.cond = new Value(tagToken.args, this.picx);
    this.cases = [];
    this.elseTemplates = [];

    let p: Template[] = [];
    const stream: ParseStream = this.picx.parser
      .parseStream(remainTokens)
      .on("tag:WHEN", (token: TagToken) => {
        p = [];

        const tokenizer = new Tokenizer(token.args, this.picx.options.operatorsTrie);

        while (!tokenizer.end()) {
          const value = tokenizer.readValue();
          this.cases.push({
            val: value,
            templates: p
          });
          tokenizer.readTo(",");
        }
      })
      .on("tag:ELSE", () => (p = this.elseTemplates))
      .on("tag:ENDCASE", () => stream.stop())
      .on("template", (tpl: Template) => p.push(tpl))
      .on("end", () => {
        throw new Error(`tag ${tagToken.getText()} not closed`);
      });

    stream.start();
  },

  *render(ctx: Context, emitter: Emitter) {
    const r = this.picx.renderer;
    const cond = toValue(yield this.cond.value(ctx, ctx.opts.lenientIf));
    for (const branch of this.cases) {
      const val = evalToken(branch.val, ctx, ctx.opts.lenientIf);
      if (val === cond) {
        yield r.renderTemplates(branch.templates, ctx, emitter);
        return;
      }
    }
    yield r.renderTemplates(this.elseTemplates, ctx, emitter);
  }
} as TagImplOptions;
