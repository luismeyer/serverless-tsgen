import { Generator } from "../Generator";
import { Logger } from "../Logger";
import { ChainLink } from "../models/chain-link";
import { Serverless } from "../types";
import { createS3Import } from "./import";

function processS3(serverless: Serverless) {
  Logger.log("debug", "Handling s3 resources");

  const { service } = serverless;

  if (!service.resources) {
    return Logger.log("debug", "No cloudformation resources to handle");
  }

  // Creates import and setup ddbClient
  const importStatement = createS3Import(service.provider?.region);

  Generator.instance.collectOutput(importStatement);
}

export class S3ChainLink extends ChainLink {
  constructor() {
    super("s3", processS3);
  }
}
