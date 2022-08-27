import {
  assert,
  Tokenizer,
  evalToken,
  Emitter,
  TagToken,
  TopLevelToken,
  Context,
  Template,
  TagImplOptions,
  ParseStream
} from "../../types";
import { toEnumerable } from "../../util/collection";
import { ForloopDrop } from "../../drop/forloop-drop";
import { Hash, HashValue } from "../../template/tag/hash";

const MODIFIERS = ["offset", "limit", "reversed"];

type valueof<T> = T[keyof T];

export default {
  type: "block",
  parse(token: TagToken, remainTokens: TopLevelToken[]) {
    const tokenizer = new Tokenizer(token.args, this.picx.options.operatorsTrie);

    const variable = tokenizer.readIdentifier();
    const inStr = tokenizer.readIdentifier();
    const collection = tokenizer.readValue();
    assert(variable.size() && inStr.content === "in" && collection, () => `illegal tag: ${token.getText()}`);

    this.variable = variable.content;
    this.collection = collection;
    this.hash = new Hash(tokenizer.remaining());
    this.templates = [];
    this.elseTemplates = [];

    let p;
    const stream: ParseStream = this.picx.parser
      .parseStream(remainTokens)
      .on("start", () => (p = this.templates))
      .on("tag:ELSE", () => (p = this.elseTemplates))
      .on("tag:ENDEACH", () => stream.stop())
      .on("template", (tpl: Template) => p.push(tpl))
      .on("end", () => {
        throw new Error(`tag ${token.getText()} not closed`);
      });

    stream.start();
  },
  *render(ctx: Context, emitter: Emitter): Generator<unknown, void | string, HashValue | Template[]> {
    const r = this.picx.renderer;
    let collection = toEnumerable(yield evalToken(this.collection, ctx));

    if (!collection.length) {
      yield r.renderTemplates(this.elseTemplates, ctx, emitter);
      return;
    }

    const continueKey = `continue-${this.variable}-${this.collection.getText()}`;
    ctx.push({ continue: ctx.getRegister(continueKey) });
    const hash = yield this.hash.render(ctx);
    ctx.pop();

    const modifiers = this.picx.options.orderedFilterParameters
      ? Object.keys(hash).filter((x) => MODIFIERS.includes(x))
      : MODIFIERS.filter((x) => hash[x] !== undefined);

    collection = modifiers.reduce((collection, modifier: valueof<typeof MODIFIERS>) => {
      if (modifier === "offset") return offset(collection, hash["offset"]);
      if (modifier === "limit") return limit(collection, hash["limit"]);
      return reversed(collection);
    }, collection);

    ctx.setRegister(continueKey, (hash["offset"] || 0) + collection.length);
    const scope = { loop: new ForloopDrop(collection.length, this.collection.getText(), this.variable) };
    ctx.push(scope);
    for (const item of collection) {
      scope[this.variable] = item;
      yield r.renderTemplates(this.templates, ctx, emitter);
      if (emitter["break"]) {
        emitter["break"] = false;
        break;
      }
      emitter["continue"] = false;
      scope.loop.next();
    }
    ctx.pop();
  }
} as TagImplOptions;

function reversed<T>(arr: Array<T>) {
  return [...arr].reverse();
}

function offset<T>(arr: Array<T>, count: number) {
  return arr.slice(count);
}

function limit<T>(arr: Array<T>, count: number) {
  return arr.slice(0, count);
}
