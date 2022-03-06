import { existsSync, rmSync, writeFileSync } from "fs";
import { resolve } from "path";
import prettier from "prettier";

import { Logger } from "./Logger";
import { Custom } from "./types";

export class Generator {
  // default output file
  private outputFile = "serverless.ts";
  private outputData: string[] = [];

  private static _generator: Generator;

  private constructor() {}

  public static get instance(): Generator {
    if (!this._generator) {
      this._generator = new Generator();
    }

    return this._generator;
  }

  public init(custom?: Custom) {
    if (!custom) {
      Logger.log("notice", "Missing custom config in serverless.yml");
      return;
    }

    if (custom.tsgen?.outfile) {
      this.outputFile = resolve(custom.tsgen.outfile);
    }

    if (existsSync(this.outputFile)) {
      rmSync(this.outputFile, { force: true });
    }

    writeFileSync(this.outputFile, "");
  }

  public collectOutput(...data: string[]) {
    this.outputData = [...this.outputData, ...data];
  }

  public generateOutput() {
    Logger.log("notice", "Generating typescript files");

    const output = prettier.format(this.outputData.join("\n"), {
      semi: false,
      parser: "babel",
    });

    writeFileSync(this.outputFile, output);
  }
}
