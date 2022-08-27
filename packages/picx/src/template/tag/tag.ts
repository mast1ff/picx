import { isFunction } from "../../util/underscore";
import { Picx } from "../../picx";
import { TemplateImpl } from "../../template/template-impl";
import { Emitter, Hash, Context, TagToken, Template, TopLevelToken } from "../../types";
import { TagImpl } from "./tag-impl";
import { HashValue } from "./hash";

export class Tag extends TemplateImpl<TagToken> implements Template {
  public name: string;
  private impl: TagImpl | null = null;

  public constructor(token: TagToken, tokens: TopLevelToken[], picx: Picx) {
    super(token);
    this.name = token.name;

    let impl;
    try {
      impl = picx.tags.get(token.name);
    } catch (err) {
      if (picx.options.strictTags) {
        throw err;
      } else {
        impl = null;
      }
    }

    if (impl) {
      this.impl = Object.create(impl);
      this.impl!.picx = picx;
      if (this.impl!.parse) {
        this.impl!.parse(token, tokens);
      }
    }
  }
  public *render(ctx: Context, emitter: Emitter): Generator<unknown, unknown, HashValue | unknown> {
    const hash = (yield new Hash(this.token.args).render(ctx)) as HashValue;
    const impl = this.impl;
    if (!impl) {
      emitter.write(`<!-- ${this.name} ${this.token.args} -->`);
    } else if (isFunction(impl.render)) {
      return yield impl.render(ctx, emitter, hash);
    }
  }
}
