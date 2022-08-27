import { Tokenizer, assert, Template, Context, TagImplOptions, TagToken, TopLevelToken } from "../../types";
import { evalQuotedToken } from "../../render/expression";

export default {
  parse(tagToken: TagToken, remainTokens: TopLevelToken[]) {
    const tokenizer = new Tokenizer(tagToken.args, this.picx.options.operatorsTrie);
    this.variable = readVariableName(tokenizer);
    assert(this.variable, () => `${tagToken.args} not valid identifier`);

    this.templates = [];

    const stream = this.picx.parser.parseStream(remainTokens);
    stream
      .on("tag:ENDCAPTURE", () => stream.stop())
      .on("template", (tpl: Template) => this.templates.push(tpl))
      .on("end", () => {
        throw new Error(`tag ${tagToken.getText()} not closed`);
      });
    stream.start();
  },
  *render(ctx: Context): Generator<unknown, void, string> {
    const r = this.picx.renderer;
    const html = yield r.renderTemplates(this.templates, ctx);
    ctx.bottom()[this.variable] = html;
  }
} as TagImplOptions;

function readVariableName(tokenizer: Tokenizer) {
  const word = tokenizer.readIdentifier().content;
  if (word) return word;
  const quoted = tokenizer.readQuoted();
  if (quoted) return evalQuotedToken(quoted);
}
