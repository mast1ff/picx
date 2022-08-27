import { TokenizationError } from "../util/error";
import { NormalizedFullOptions } from "../options";
import { TokenKind } from "../parser/token-kind";
import { Tokenizer } from "../parser/tokenizer";
import { DelimitedToken } from "./delimited-token";

export class PicxTagToken extends DelimitedToken {
  public name: string;
  public args: string;
  public constructor(input: string, begin: number, end: number, options: NormalizedFullOptions, file?: string) {
    const value = input.slice(begin, end);
    super(TokenKind.Tag, value, input, begin, end, false, false, file);

    if (!/\S/.test(value)) {
      // A line that contains only whitespace.
      this.name = "";
      this.args = "";
    } else {
      const tokenizer = new Tokenizer(this.content, options.operatorsTrie);
      this.name = tokenizer.readTagName();
      if (!this.name) throw new TokenizationError(`illegal picx tag syntax`, this);

      tokenizer.skipBlank();
      this.args = tokenizer.remaining();
    }
  }
}
