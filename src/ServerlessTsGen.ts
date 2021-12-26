import { Chain } from "./chain";
import { ddbLink } from "./ddb";
import { generateOutput, initOutput } from "./generator";
import { initLogger, log } from "./logger";
import { Serverless, ServerlessPlugin } from "./types";

const chain = new Chain().addLink(ddbLink);

export class ServerlessTSGen extends ServerlessPlugin {
  constructor(serverless: Serverless) {
    super();

    initOutput(serverless.service.custom);

    initLogger({
      debug: serverless.cli.log,
      error: serverless.cli.log,
      notice: serverless.cli.log,
      warning: serverless.cli.log,
    });

    this.commands = {
      tsgen: {
        usage: "Generate ts files for your AWS resources.",
        lifecycleEvents: ["run"],
      },
    };

    this.hooks = {
      "tsgen:run": () => {
        log("notice", "Run tsgen plugin");

        chain.execute(serverless);
      },
      "after:tsgen:run": () => {
        log("notice", "After tsgen plugin run");

        generateOutput();
      },
    };
  }
}
