import { TokenizationError } from "../util/error";
import { NormalizedFullOptions } from "../options";
import { TokenKind } from "../parser/token-kind";
import { Tokenizer } from "../parser/tokenizer";
import { DelimitedToken } from "./delimited-token";

export class TagToken extends DelimitedToken {
  public name: string;
  public args: string;
  constructor(input: string, begin: number, end: number, options: NormalizedFullOptions, file?: string) {
    const { trimTagLeft, trimTagRight, tagDelimiterLeft, tagDelimiterRight } = options;
    const value = input.slice(begin + tagDelimiterLeft.length, end - tagDelimiterRight.length);
    super(TokenKind.Tag, value, input, begin, end, trimTagLeft, trimTagRight, file);

    const tokenizer = new Tokenizer(this.content, options.operatorsTrie);
    this.name = tokenizer.readTagName();
    if (!this.name) throw new TokenizationError(`illegal tag syntax`, this);

    tokenizer.skipBlank();
    this.args = tokenizer.remaining();
  }
}
