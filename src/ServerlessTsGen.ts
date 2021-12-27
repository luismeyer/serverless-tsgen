import { Chain } from "./chain";
import { ddbLink } from "./ddb";
import { generateOutput, initOutput } from "./generator";
import { initLogger, log } from "./logger";
import { Serverless, ServerlessPlugin } from "./types";

const chain = new Chain().append(ddbLink);

export class ServerlessTSGen extends ServerlessPlugin {
  constructor(serverless: Serverless) {
    super();

    /**
     * For v2 the cli only supports one logging function. In
     * v3 we can change the logging behaviour easily by
     * plugging the new log functions into our logger
     */
    initLogger({
      debug: serverless.cli.log,
      error: serverless.cli.log,
      notice: serverless.cli.log,
      warning: serverless.cli.log,
    });

    initOutput(serverless.service.custom);

    this.commands = {
      tsgen: {
        usage: "Generate ts files for your AWS resources.",
        lifecycleEvents: ["run"],
      },
    };

    this.hooks = {
      "tsgen:run": () => {
        log("notice", "Execute tsgen plugin");

        chain.execute(serverless);
      },
      "after:tsgen:run": () => {
        log("notice", "After tsgen plugin run");

        generateOutput();
      },
    };
  }
}
