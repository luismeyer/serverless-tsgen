import { Generator } from "../Generator";
import { Logger } from "../Logger";
import { ChainLink } from "../models/chain-link";
import { Serverless } from "../types";
import { createGetItem, GetItemOptions } from "./get";
import { createDDBImport } from "./import";
import { createQueryGSI, QueryItemsOptions } from "./query";
import { createDDBTypes } from "./types";

/**
 * Processes the DynamoDB resources
 * @param serverless Configurtion
 * @returns void
 */
function processDDB(serverless: Serverless) {
  const { service } = serverless;

  if (!service.resources) {
    return Logger.log("debug", "No cloudformation resources to handle");
  }

  // Creates import and setup ddbClient
  const importStatement = createDDBImport(service.provider?.region);

  // Generate result types
  const ddbUtilTypes = createDDBTypes();

  // Collect imports and utility types
  Generator.instance.collectOutput(
    importStatement,
    ddbUtilTypes,
    GetItemOptions,
    QueryItemsOptions
  );

  // Unwrap the cloudformation input
  const resourceDefs = Object.entries(service.resources.Resources);

  // Filter the table resources
  const ddbTables = resourceDefs.filter(
    ([_, def]) => def.Type === "AWS::DynamoDB::Table"
  );

  ddbTables.forEach(([key, tableDefinition]) => {
    Logger.log("debug", `Handling DynamoDB resource ${key}`);

    if (!tableDefinition.Properties.TableName) {
      return Logger.log(
        "warning",
        `Missing TableName for resource: "${key}". Cannot generate code for tables without a custom name.`
      );
    }

    const getItem = createGetItem(tableDefinition);
    if (getItem) {
      Generator.instance.collectOutput(getItem);
    }

    tableDefinition.Properties.GlobalSecondaryIndexes.forEach((index) => {
      const queryGSI = createQueryGSI(tableDefinition, index);

      Generator.instance.collectOutput(queryGSI);
    });
  });
}

export class DDBChainLink extends ChainLink {
  constructor() {
    super("ddb", processDDB);
  }
}
