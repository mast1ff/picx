import { Tokenizer, Emitter, TagToken, Context, TagImplOptions } from "../../types";
import { isNumber, stringify } from "../../util/underscore";

export default {
  parse(token: TagToken) {
    const tokenizer = new Tokenizer(token.args, this.picx.options.operatorsTrie);
    this.variable = tokenizer.readIdentifier().content;
  },
  render(context: Context, emitter: Emitter) {
    const scope = context.environments;
    if (!isNumber(scope[this.variable])) {
      scope[this.variable] = 0;
    }
    emitter.write(stringify(--scope[this.variable]));
  }
} as TagImplOptions;
