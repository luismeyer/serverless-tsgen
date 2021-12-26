import camelcase from "camelcase";

import { log } from "../logger";
import { DynamoDBResource } from "../types";
import { DocumentClient } from "./import";
import {
  DDBResultDataKey,
  DDBResultErrorKey,
  DDBResultSuccessKey,
  DDBResultType,
} from "./types";
import { typeDefinition } from "./utils";

const GetItemOptions = "GetItemOptions";
const ErrorMessage = "Get item error";

/**
 * Reduced get item options. Based on GetItemInput of AWS sdk
 */
export const GetItemOptionsType = `
  type ${GetItemOptions} = Omit<${DocumentClient}.GetItemInput, "TableName" | "Key">;
`;

/**
 * Creates the GetItem function
 * @param resourceKey Key of the DDB resource
 * @param table Table resource
 * @returns GetItem function definition as a string
 */
export const createGetItem = (
  resourceKey: string,
  table: DynamoDBResource
): string | undefined => {
  const { TableName, AttributeDefinitions, KeySchema } = table.Properties;
  if (!TableName) {
    return void log("error", `Missing TableName for resource: ${resourceKey}`);
  }

  const funcName = `get${camelcase(TableName, { pascalCase: true })}`;
  const generic = "T";

  const hashKey = KeySchema.find((key) => key.KeyType === "HASH");
  if (!hashKey) {
    throw new Error(`Missing hash key for table: ${TableName}`);
  }

  // Retrieve the type of the primary key
  const hashKeyType = typeDefinition(
    hashKey.AttributeName ?? "",
    AttributeDefinitions,
    true
  );

  if (!hashKeyType) {
    throw new Error(
      `Missing hash key in attribute definitions of table: ${TableName}`
    );
  }

  const args = `${hashKey.AttributeName}: ${hashKeyType}, options?: ${GetItemOptions}`;

  return `
    export async function ${funcName}<${generic}>(${args}): Promise<${DDBResultType}<${generic}>> {
      const res = await ddbClient
        .get({
          ...options,
          TableName: "${TableName}", 
          Key: { ${hashKey.AttributeName} }
        })
        .promise();

      if (res.$response.error || !res.Item) {
        return {
          ${DDBResultSuccessKey}: false,
          ${DDBResultErrorKey}: res.$response.error
            ? res.$response.error.message
            : "${ErrorMessage}",
        };
      }

      return {
        ${DDBResultSuccessKey}: true,
        ${DDBResultDataKey}: res.Item as ${generic},
      };
    }
  `;
};
