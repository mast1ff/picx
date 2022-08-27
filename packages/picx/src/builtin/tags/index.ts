import { TagImplOptions } from "../../template/tag/tag-impl-options";
import assign from "./assign";
import Each from "./each";
import capture from "./capture";
import Case from "./case";
import comment from "./comment";
import include from "./include";
import render from "./render";
import decrement from "./decrement";
import cycle from "./cycle";
import If from "./if";
import increment from "./increment";
import layout from "./layout";
import block from "./block";
import raw from "./raw";
import tablerow from "./tablerow";
import unless from "./unless";
import Break from "./break";
import Continue from "./continue";
import echo from "./echo";
import inlineComment from "./inline-comment";
import script from "./script";

const tags: { [key: string]: TagImplOptions } = {
  ASSIGN: assign,
  EACH: Each,
  CAPTURE: capture,
  CASE: Case,
  COMMENT: comment,
  INCLUDE: include,
  RENDER: render,
  DECREMENT: decrement,
  INCREMENT: increment,
  CYCLE: cycle,
  IF: If,
  LAYOUT: layout,
  BLOCK: block,
  RAW: raw,
  TABLEROW: tablerow,
  UNLESS: unless,
  BREAK: Break,
  CONTINUE: Continue,
  ECHO: echo,
  SCRIPT: script,
  "#": inlineComment
};

export default tags;
