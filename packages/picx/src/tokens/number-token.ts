import { TokenKind } from "../parser/token-kind";
import { Token } from "./token";
import { IdentifierToken } from "./identifier-token";

export class NumberToken extends Token {
  constructor(public whole: IdentifierToken, public decimal?: IdentifierToken) {
    super(TokenKind.Number, whole.input, whole.begin, decimal ? decimal.end : whole.end, whole.file);
  }
}
