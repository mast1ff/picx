import { TokenKind } from "../parser/token-kind";
import { Token } from "./token";
import { ValueToken } from "./value-token";
import { IdentifierToken } from "./identifier-token";

export class HashToken extends Token {
  constructor(
    public input: string,
    public begin: number,
    public end: number,
    public name: IdentifierToken,
    public value?: ValueToken,
    public file?: string
  ) {
    super(TokenKind.Hash, input, begin, end, file);
  }
}
