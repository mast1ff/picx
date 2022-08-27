import { changeCase, padStart, padEnd } from "./underscore";
import { PicxDate } from "./date";

const rFormat = /%([-_0^#:]+)?(\d+)?([EO])?(.)/;
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNamesShort = monthNames.map(abbr);
const dayNamesShort = dayNames.map(abbr);
const suffixes = {
  1: "st",
  2: "nd",
  3: "rd",
  default: "th"
};
interface FormatOptions {
  flags: object;
  width?: string;
  modifier?: string;
}

function abbr(str: string) {
  return str.slice(0, 3);
}

// prototype extensions
function daysInMonth(d: PicxDate) {
  const feb = isLeapYear(d) ? 29 : 28;
  return [31, feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
}
function getDayOfYear(d: PicxDate) {
  let num = 0;
  for (let i = 0; i < d.getMonth(); ++i) {
    num += daysInMonth(d)[i];
  }
  return num + d.getDate();
}
function getWeekOfYear(d: PicxDate, startDay: number) {
  // Skip to startDay of this week
  const now = getDayOfYear(d) + (startDay - d.getDay());
  // Find the first startDay of the year
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const then = 7 - jan1.getDay() + startDay;
  return String(Math.floor((now - then) / 7) + 1);
}
function isLeapYear(d: PicxDate) {
  const year = d.getFullYear();
  return !!((year & 3) === 0 && (year % 100 || (year % 400 === 0 && year)));
}
function getSuffix(d: PicxDate) {
  const str = d.getDate().toString();
  const index = parseInt(str.slice(-1));
  return suffixes[index] || suffixes["default"];
}
function century(d: PicxDate) {
  return parseInt(d.getFullYear().toString().substring(0, 2), 10);
}

// default to 0
const padWidths = {
  d: 2,
  e: 2,
  H: 2,
  I: 2,
  j: 3,
  k: 2,
  l: 2,
  L: 3,
  m: 2,
  M: 2,
  S: 2,
  U: 2,
  W: 2
};

// default to '0'
const padChars = {
  a: " ",
  A: " ",
  b: " ",
  B: " ",
  c: " ",
  e: " ",
  k: " ",
  l: " ",
  p: " ",
  P: " "
};
const formatCodes = {
  a: (d: PicxDate) => dayNamesShort[d.getDay()],
  A: (d: PicxDate) => dayNames[d.getDay()],
  b: (d: PicxDate) => monthNamesShort[d.getMonth()],
  B: (d: PicxDate) => monthNames[d.getMonth()],
  c: (d: PicxDate) => d.toLocaleString(),
  C: (d: PicxDate) => century(d),
  d: (d: PicxDate) => d.getDate(),
  e: (d: PicxDate) => d.getDate(),
  H: (d: PicxDate) => d.getHours(),
  I: (d: PicxDate) => String(d.getHours() % 12 || 12),
  j: (d: PicxDate) => getDayOfYear(d),
  k: (d: PicxDate) => d.getHours(),
  l: (d: PicxDate) => String(d.getHours() % 12 || 12),
  L: (d: PicxDate) => d.getMilliseconds(),
  m: (d: PicxDate) => d.getMonth() + 1,
  M: (d: PicxDate) => d.getMinutes(),
  N: (d: PicxDate, opts: FormatOptions) => {
    const width = Number(opts.width) || 9;
    const str = String(d.getMilliseconds()).substr(0, width);
    return padEnd(str, width, "0");
  },
  p: (d: PicxDate) => (d.getHours() < 12 ? "AM" : "PM"),
  P: (d: PicxDate) => (d.getHours() < 12 ? "am" : "pm"),
  q: (d: PicxDate) => getSuffix(d),
  s: (d: PicxDate) => Math.round(d.getTime() / 1000),
  S: (d: PicxDate) => d.getSeconds(),
  u: (d: PicxDate) => d.getDay() || 7,
  U: (d: PicxDate) => getWeekOfYear(d, 0),
  w: (d: PicxDate) => d.getDay(),
  W: (d: PicxDate) => getWeekOfYear(d, 1),
  x: (d: PicxDate) => d.toLocaleDateString(),
  X: (d: PicxDate) => d.toLocaleTimeString(),
  y: (d: PicxDate) => d.getFullYear().toString().substring(2, 4),
  Y: (d: PicxDate) => d.getFullYear(),
  z: (d: PicxDate, opts: FormatOptions) => {
    const nOffset = Math.abs(d.getTimezoneOffset());
    const h = Math.floor(nOffset / 60);
    const m = nOffset % 60;
    return (
      (d.getTimezoneOffset() > 0 ? "-" : "+") + padStart(h, 2, "0") + (opts.flags[":"] ? ":" : "") + padStart(m, 2, "0")
    );
  },
  t: () => "\t",
  n: () => "\n",
  "%": () => "%"
};
(formatCodes as any).h = formatCodes.b;

export default function (d: PicxDate, formatStr: string) {
  let output = "";
  let remaining = formatStr;
  let match;
  while ((match = rFormat.exec(remaining))) {
    output += remaining.slice(0, match.index);
    remaining = remaining.slice(match.index + match[0].length);
    output += format(d, match);
  }
  return output + remaining;
}

function format(d: PicxDate, match: RegExpExecArray) {
  const [input, flagStr = "", width, modifier, conversion] = match;
  const convert = formatCodes[conversion];
  if (!convert) return input;
  const flags = {};
  for (const flag of flagStr) flags[flag] = true;
  let ret = String(convert(d, { flags, width, modifier }));
  let padChar = padChars[conversion] || "0";
  let padWidth = width || padWidths[conversion] || 0;
  if (flags["^"]) ret = ret.toUpperCase();
  else if (flags["#"]) ret = changeCase(ret);
  if (flags["_"]) padChar = " ";
  else if (flags["0"]) padChar = "0";
  if (flags["-"]) padWidth = 0;
  return padStart(ret, padWidth, padChar);
}
