import { existsSync, rmSync, writeFileSync } from "fs";
import { resolve } from "path";

import { log } from "./logger";
import { Custom } from "./types";

let outputFile = "tsgen.ts";
let outputData: string[] = [];

export const initOutput = (custom?: Custom) => {
  if (!custom) {
    return;
  }

  outputFile = resolve(custom.tsgen.outfile);

  if (existsSync(outputFile)) {
    rmSync(outputFile, { force: true });
  }

  writeFileSync(outputFile, "");
};

export const collectOutput = (...data: string[]) => {
  outputData = [...outputData, ...data];
};

export const generateOutput = () => {
  log("notice", "Generating typescript files");

  writeFileSync(outputFile, outputData.join("\n"));
};
