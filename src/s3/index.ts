import { log } from "../logger";
import { ChainLink } from "../models/chain-link";
import { Serverless } from "../types";

function processS3(_serverless: Serverless) {
  log("debug", "Handling s3 resources");
}

export class S3ChainLink extends ChainLink {
  constructor() {
    super("s3", processS3);
  }
}
