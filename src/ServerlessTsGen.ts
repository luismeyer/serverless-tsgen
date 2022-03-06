import { DDBChainLink } from "./ddb";
import { Generator } from "./Generator";
import { Logger } from "./Logger";
import { Chain } from "./models/chain";
import { S3ChainLink } from "./s3";
import { Serverless, ServerlessPlugin } from "./types";

/**
 * Chain of responsibility that holds resource handlers.
 * Every chain link represents a handler that decides
 * if it can process the serverless.yml
 */
const ResourceChain = new Chain();
ResourceChain.append(new DDBChainLink());
ResourceChain.append(new S3ChainLink());

export class ServerlessTSGen extends ServerlessPlugin {
  constructor(serverless: Serverless) {
    super();

    /**
     * Extend the serverless schema to validate our custom config.
     * Since we can run with zero configuration nothing is required
     */
    serverless.configSchemaHandler.defineCustomProperties({
      type: "object",
      required: [],

      properties: {
        tsgen: {
          type: "object",
          required: [],

          properties: {
            outfile: { type: "string" },
            resources: {
              type: "array",
              items: { enum: ResourceChain.keys },
              uniqueItems: true,
              additionalItems: false,
            },
          },
        },
      },
    });

    /**
     * For v2 the cli only supports one logging function. In
     * v3 we can change the logging behaviour easily by
     * plugging the new log functions into our logger
     */
    Logger.init({
      debug: serverless.cli.log,
      error: serverless.cli.log,
      notice: serverless.cli.log,
      warning: serverless.cli.log,
    });

    Generator.instance.init(serverless.service.custom);

    this.commands = {
      tsgen: {
        usage: "Generate ts files for your AWS resources.",
        lifecycleEvents: ["run"],
      },
    };

    this.hooks = {
      "tsgen:run": () => {
        Logger.log("notice", "Executing tsgen plugin...");

        ResourceChain.execute(serverless);
      },
      "after:tsgen:run": () => {
        Logger.log("notice", "After tsgen plugin execution");

        Generator.instance.generateOutput();
      },
    };
  }
}
