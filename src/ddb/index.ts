import { Generator } from "../Generator";
import { Logger } from "../Logger";
import { ChainLink } from "../models/chain-link";
import { createNameVariable } from "../name";
import { isDynamoDBResource, Serverless } from "../types";
import { createGetItem, GetItemOptions } from "./get";
import { createDDBImport } from "./import";
import { createQueryGSI, QueryItemsOptions } from "./query";

/**
 * Processes the DynamoDB resources
 * @param serverless Configurtion
 * @returns void
 */
const processDDB = (serverless: Serverless) => {
  const { service } = serverless;

  if (!service.resources) {
    return Logger.log("debug", "No cloudformation resources to handle");
  }

  // Creates import and setup ddbClient
  const importStatement = createDDBImport(service.provider?.region);

  // Collect imports and utility types
  Generator.instance.collectOutput(
    importStatement,
    QueryItemsOptions,
    GetItemOptions
  );

  // Unwrap the cloudformation input
  const resourceDefs = Object.entries(service.resources.Resources);

  // Filter the table resources
  const ddbTables = resourceDefs.filter(
    ([_, def]) => def.Type === "AWS::DynamoDB::Table"
  );

  ddbTables.forEach(([key, tableDefinition]) => {
    if (!isDynamoDBResource(tableDefinition)) {
      return;
    }

    const { Properties } = tableDefinition;

    Logger.log("debug", `Handling DynamoDB resource ${key}`);

    if (!Properties.TableName) {
      return Logger.log(
        "warning",
        `Missing TableName for resource: "${key}". Cannot generate code for tables without a custom name.`
      );
    }

    const tableNameVariable = createNameVariable(Properties.TableName, "TABLE");

    Generator.instance.collectOutput(tableNameVariable.definition);

    const getItem = createGetItem(tableNameVariable, tableDefinition);

    if (getItem) {
      Generator.instance.collectOutput(getItem);
    }

    Properties.GlobalSecondaryIndexes.forEach((index) => {
      if (!index.IndexName) {
        return Logger.log(
          "warning",
          `Missing IndexName for resource: "${index}".`
        );
      }

      const indexNameVariable = createNameVariable(index.IndexName, "INDEX");

      const queryGSI = createQueryGSI({
        tableName: tableNameVariable,
        indexName: indexNameVariable,
        tableResource: tableDefinition,
        indexInfo: index,
      });

      Generator.instance.collectOutput(indexNameVariable.definition, queryGSI);
    });
  });
};

export class DDBChainLink extends ChainLink {
  constructor() {
    super("ddb", processDDB);
  }
}
