import { assert, Tokenizer, Emitter, Hash, TagToken, TopLevelToken, Context, TagImplOptions } from "../../types";
import BlockMode from "../../context/block-mode";
import { BlankDrop } from "../../drop/blank-drop";
import { parseFilePath, renderFilePath } from "./render";

export default {
  parseFilePath,
  renderFilePath,
  parse(token: TagToken, remainTokens: TopLevelToken[]) {
    const tokenizer = new Tokenizer(token.args, this.picx.options.operatorsTrie);
    this["file"] = this.parseFilePath(tokenizer, this.picx);
    this["currentFile"] = token.file;
    this.hash = new Hash(tokenizer.remaining());
    this.tpls = this.picx.parser.parseTokens(remainTokens);
  },
  *render(ctx: Context, emitter: Emitter) {
    const { picx, hash, file } = this;
    const { renderer } = picx;
    if (file === null) {
      ctx.setRegister("blockMode", BlockMode.OUTPUT);
      yield renderer.renderTemplates(this.tpls, ctx, emitter);
      return;
    }
    const filepath = yield this.renderFilePath(this["file"], ctx, picx);
    assert(filepath, () => `illegal filename "${filepath}"`);
    const templates = yield picx._parseLayoutFile(filepath, ctx.sync, this["currentFile"]);

    // render remaining contents and store rendered results
    ctx.setRegister("blockMode", BlockMode.STORE);
    const html = yield renderer.renderTemplates(this.tpls, ctx);
    const blocks = ctx.getRegister("blocks");

    // set whole content to anonymous block if anonymous doesn't specified
    if (blocks[""] === undefined) blocks[""] = (parent: BlankDrop, emitter: Emitter) => emitter.write(html);
    ctx.setRegister("blockMode", BlockMode.OUTPUT);

    // render the layout file use stored blocks
    ctx.push(yield hash.render(ctx));
    yield renderer.renderTemplates(templates, ctx, emitter);
    ctx.pop();
  }
} as TagImplOptions;
