/**
 * This File is copied from https://github.com/XappMedia/serverless-plugin-types
 * Since it seems like the repo isn't maintained anymore we copy the files
 * instead of using the npm package
 */

import { StringOrObject } from "./utils";

/**
 * Environment variables assigned to a function. They can
 * either be a string or a CloudFormation function used to
 * retrieve the value.
 */
export type Environment = {
  [key: string]: StringOrObject;
};
