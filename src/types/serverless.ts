/**
 * This File is copied from https://github.com/XappMedia/serverless-plugin-types
 * Since it seems like the repo isn't maintained anymore we copy the files
 * instead of using the npm package
 */

import { Custom } from "./custom";
import { Function } from "./function";
import { Resources } from "./resources";
import { StringOrObject } from "./utils";

/**
 * Attributes that can be used when importing
 * api gateway paths from other serverless.yml files.
 */
export type ApiGatewayImports = {
  restApiId: StringOrObject;
  restApiRootResourceId: StringOrObject;
  restApiResources: {
    [resourcePath: string]: StringOrObject;
  };
};

/**
 * Attributes that are in the Serverless Provider section.
 */
export type ServerlessProvider = {
  name: string;
  runtime: string;
  versionFunctions?: boolean;
  memorySize?: number;
  endpointType?: string;
  stage?: string;
  region?: string;
  profile?: string;
  stackTags?: string[];
  environment?: string;
  timeout?: number;
  deploymentBucket: {
    name: string;
  };
  apiGateway?: ApiGatewayImports;
};

/**
 * CLI object that allows logging to the Serverless console.
 */
export type CLI = {
  log(msg: string): void;
};

/**
 * Collection of lambda function declarations.
 */
export type ServerlessFunctions = {
  [name: string]: Function;
};

/**
 * The object that contains all the declarations in the serverless.yml file.
 */
export type ServerlessService = {
  service: string;
  provider?: ServerlessProvider;
  custom?: Custom;
  functions?: ServerlessFunctions;
  resources?: Resources;
};

/**
 * The Serverless object that is injected in to the Serverless Plugin.
 */
export type Serverless = {
  /**
   * The Service object which contains all the details described
   * in the serverless.yml file.
   *
   * Custom: This is a "Custom" object which holds parameters for a plugin
   * to use.  It is typically an object. For example:
   *
   * serverless.yml
   * ```
   * custom:
   *    MyCustomParameters:
   *       param1: Value1
   *       param2: Value2
   * ```
   *
   * This can be retrieved in the plugin like so:
   *
   * const param1 = serverless.service.custom.param1;
   * const param2 = serverless.service.custom.param2;
   */
  service: ServerlessService;
  /**
   * The CLI object which allows logging to the console.
   */
  cli: CLI;

  // https://www.serverless.com/framework/docs/guides/plugins/custom-configuration
  configSchemaHandler: {
    defineTopLevelProperty: (
      plugin: string,
      jsonSchema: Record<string, any>
    ) => void;

    defineCustomProperties: (jsonSchema: Record<string, any>) => void;

    defineFunctionEvent: (
      providerName: string,
      pluginEvent: string,
      jsonSchema: Record<string, any>
    ) => void;

    defineFunctionEventProperties: (
      providerName: string,
      event: string,
      jsonSchema: Record<string, any>
    ) => void;

    defineFunctionProperties: (
      providerName: string,
      jsonSchema: Record<string, any>
    ) => void;

    defineProvider: (
      providerName: string,
      jsonSchema: Record<string, any>
    ) => void;
  };
};
