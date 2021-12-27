import { ChainLink } from "../chain";
import { collectOutput } from "../generator";
import { createGetItem, GetItemOptions } from "./get";
import { createDDBImport } from "./import";
import { createQueryGSI, QueryItemOptionsType } from "./query";
import { createDDBTypes } from "./types";

export const DDB_KEY = "ddb";

export const ddbLink: ChainLink = {
  canHandle: ({ service }) => {
    return Boolean(service.custom?.tsgen.services.includes(DDB_KEY));
  },
  handle: ({ service }) => {
    if (!service.resources) {
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
      const getItem = createGetItem(key, tableDefinition);
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
