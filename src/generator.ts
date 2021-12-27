import { existsSync, rmSync, writeFileSync } from "fs";
import { resolve } from "path";

import { log } from "./logger";
import { Custom } from "./types";

// default output file
let outputFile = "serverless.ts";

let outputData: string[] = [];

export const initOutput = (custom?: Custom) => {
  if (!custom) {
    log("notice", "Missing custom config in serverless.yml");
    return;
  }

  if (custom.tsgen?.outfile) {
    outputFile = resolve(custom.tsgen.outfile);
  }

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
