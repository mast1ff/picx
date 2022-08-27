import { TokenKind } from "../parser/token-kind";
import { Token } from "./token";

export class LiteralToken extends Token {
  public literal: string;
  public constructor(public input: string, public begin: number, public end: number, public file?: string) {
    super(TokenKind.Literal, input, begin, end, file);
    this.literal = this.getText();
  }
}
