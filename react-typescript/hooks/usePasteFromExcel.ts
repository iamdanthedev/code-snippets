import React from "react";
import { split } from "lodash";

function getFractionSeparator(...values: string[]) {
  const concat = values.join("");

  if (concat.includes(".")) {
    return concat.includes(",") ? ",." : " .";
  }

  return " ,";
}

function tryParseExcel(e: React.ClipboardEvent) {
  if (!e.clipboardData.types.includes("text/html")) {
    return null;
  }

  const value = e.clipboardData.getData("text/html");

  const re = /<td[^>]+>(.+)<\/td>/gm;
  const matches = Array.from(value.matchAll(re));
  const fractSep = getFractionSeparator(...matches.map(x => x[1]));
  const values = matches
    .map(x => x[1])
    .compact()
    .map(x => x.toNumeric(fractSep));

  return values.length === 3 ? values.map(x => x.toString()) : null;
}

function tryParsePlain(e: React.ClipboardEvent) {
  if (!e.clipboardData.types.includes("text/plain")) {
    return null;
  }

  let value = e.clipboardData.getData("text/plain");
  value = value.replace(/[^\d,.\s]/g, "");

  let res = split(value, /\s\s/g);

  if (res.length !== 3) {
    res = split(value, /[\n\t\s]/g).compact();
  }

  return res.length === 3
    ? res.map(x => x.toNumeric(getFractionSeparator(...res)).toString())
    : null;
}

function tryParseSingle(e: React.ClipboardEvent) {
  if (!e.clipboardData.types.includes("text/plain")) {
    return null;
  }

  let value = e.clipboardData.getData("text/plain");
  value = value.replace(/[^\d,.\s]/g, "");
  const frSep = getFractionSeparator(value);
  return value.toNumeric(frSep).toString();
}

export function usePasteFromExcel(
  cb: (values: string[] | string, e: React.ClipboardEvent) => void
) {
  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const values = tryParseExcel(e) || tryParsePlain(e) || tryParseSingle(e);
    cb(values || [], e);
  };

  return { onPaste };
}
