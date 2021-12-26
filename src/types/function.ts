/**
 * This File is copied from https://github.com/XappMedia/serverless-plugin-types
 * Since it seems like the repo isn't maintained anymore we copy the files
 * instead of using the npm package
 */

import { Environment } from "./environment";
import { Package } from "./package";

/**
 * Details of a lambda function.
 */
export type Function = {
  handler: string;
  environment?: Environment;
  name?: string;
  description?: string;
  runtime?: string;
  memorySize?: number;
  timeout?: number;
  provisionedConcurrency?: number;
  reservedConcurrency?: number;
  tracing?: string;
  package?: Package;
  [key: string]: any;
};
