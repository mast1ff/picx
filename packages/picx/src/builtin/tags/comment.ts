import { TagToken } from "../../tokens/tag-token";
import { TopLevelToken } from "../../tokens/toplevel-token";
import { TagImplOptions } from "../../template/tag/tag-impl-options";

export default {
  parse(tagToken: TagToken, remainTokens: TopLevelToken[]) {
    const stream = this.picx.parser.parseStream(remainTokens);
    stream
      .on("token", (token: TagToken) => {
        if (token.name === "endcomment") stream.stop();
      })
      .on("end", () => {
        throw new Error(`tag ${tagToken.getText()} not closed`);
      });
    stream.start();
  }
} as TagImplOptions;
