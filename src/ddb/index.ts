import { ChainLink } from "../chain";
import { collectOutput } from "../generator";
import { log } from "../logger";
import { createGetItem, GetItemOptions } from "./get";
import { createDDBImport } from "./import";
import { createQueryGSI, QueryItemOptionsType } from "./query";
import { createDDBTypes } from "./types";

export const DDB_KEY = "ddb";

export const ddbLink: ChainLink = {
  name: "DynamoDB",
  canHandle: ({ service }) => {
    return (
      !service.custom?.tsgen?.resources ||
      Boolean(service.custom.tsgen.resources.includes(DDB_KEY))
    );
  },
  handle: ({ service }) => {
    if (!service.resources) {
      log("debug", "No cloudformation resources to handle");
      return;
    }

    // Creates import and setup ddbClient
    const importStatement = createDDBImport(service.provider?.region);

    // Generate result types
    const ddbUtilTypes = createDDBTypes();

    // Collect imports and utility types
    collectOutput(
      importStatement,
      ddbUtilTypes,
      GetItemOptions,
      QueryItemOptionsType
    );

    // Unwrap the cloudformation input
    const resourceDefs = Object.entries(service.resources.Resources);

    // Filter the table resources
    const ddbTables = resourceDefs.filter(
      ([_, def]) => def.Type === "AWS::DynamoDB::Table"
    );

    ddbTables.forEach(([key, tableDefinition]) => {
      log("debug", `Handling DynamoDB resource ${key}`);

      if (!tableDefinition.Properties.TableName) {
        return log(
          "warning",
          `Missing TableName for resource: "${key}". Cannot generate code for tables without a custom name.`
        );
      }

      const getItem = createGetItem(tableDefinition);
      if (getItem) {
        collectOutput(getItem);
      }

      tableDefinition.Properties.GlobalSecondaryIndexes.forEach((index) => {
        const queryGSI = createQueryGSI(tableDefinition, index);

        collectOutput(queryGSI);
      });
    });
  },
};
