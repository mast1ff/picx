import {
  Value,
  TopLevelToken,
  Template,
  Emitter,
  isTruthy,
  isFalsy,
  Context,
  TagImplOptions,
  TagToken
} from "../../types";

export default {
  parse(tagToken: TagToken, remainTokens: TopLevelToken[]) {
    this.branches = [];
    this.elseTemplates = [];
    let p;
    this.picx.parser
      .parseStream(remainTokens)
      .on("start", () =>
        this.branches.push({
          predicate: new Value(tagToken.args, this.picx),
          test: isFalsy,
          templates: (p = [])
        })
      )
      .on("tag:ELSEIF", (token: TagToken) =>
        this.branches.push({
          predicate: new Value(token.args, this.picx),
          test: isTruthy,
          templates: (p = [])
        })
      )
      .on("tag:ELSE", () => (p = this.elseTemplates))
      .on("tag:ENDUNLESS", function () {
        this.stop();
      })
      .on("template", (tpl: Template) => p.push(tpl))
      .on("end", () => {
        throw new Error(`tag ${tagToken.getText()} not closed`);
      })
      .start();
  },

  *render(ctx: Context, emitter: Emitter) {
    const r = this.picx.renderer;

    for (const { predicate, test, templates } of this.branches) {
      const value = yield predicate.value(ctx, ctx.opts.lenientIf);
      if (test(value, ctx)) {
        yield r.renderTemplates(templates, ctx, emitter);
        return;
      }
    }

    yield r.renderTemplates(this.elseTemplates, ctx, emitter);
  }
} as TagImplOptions;
