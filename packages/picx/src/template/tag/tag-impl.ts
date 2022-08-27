import { Picx } from "../../picx";
import { TagImplOptions } from "./tag-impl-options";

export interface TagImpl extends TagImplOptions {
  picx: Picx;
  [key: string]: any;
}
