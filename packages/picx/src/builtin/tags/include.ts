import { assert, Tokenizer, evalToken, Hash, Emitter, TagToken, Context, TagImplOptions } from "../../types";
import BlockMode from "../../context/block-mode";
import { parseFilePath, renderFilePath } from "./render";

export default {
  parseFilePath,
  renderFilePath,
  parse(token: TagToken) {
    const args = token.args;
    const tokenizer = new Tokenizer(args, this.picx.options.operatorsTrie);
    this["file"] = this.parseFilePath(tokenizer, this.picx);
    this["currentFile"] = token.file;

    const begin = tokenizer.p;
    const withStr = tokenizer.readIdentifier();
    if (withStr.content === "with") {
      tokenizer.skipBlank();
      if (tokenizer.peek() !== ":") {
        this.withVar = tokenizer.readValue();
      } else tokenizer.p = begin;
    } else tokenizer.p = begin;

    this.hash = new Hash(tokenizer.remaining(), this.picx.options.jekyllInclude);
  },
  *render(ctx: Context, emitter: Emitter) {
    const { picx, hash, withVar } = this;
    const { renderer } = picx;
    const filepath = yield this.renderFilePath(this["file"], ctx, picx);
    assert(filepath, () => `illegal filename "${filepath}"`);

    const saved = ctx.saveRegister("blocks", "blockMode");
    ctx.setRegister("blocks", {});
    ctx.setRegister("blockMode", BlockMode.OUTPUT);
    const scope = yield hash.render(ctx);
    if (withVar) scope[filepath] = evalToken(withVar, ctx);
    const templates = yield picx._parsePartialFile(filepath, ctx.sync, this["currentFile"]);
    ctx.push(ctx.opts.jekyllInclude ? { include: scope } : scope);
    yield renderer.renderTemplates(templates, ctx, emitter);
    ctx.pop();
    ctx.restoreRegister(saved);
  }
} as TagImplOptions;
