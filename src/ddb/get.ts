import camelcase from "camelcase";

import { log } from "../logger";
import { DynamoDBResource } from "../types";
import { buildFunction } from "../typescript/function";
import { dbClient, DocumentClient } from "./import";
import {
  DDBResultDataKey,
  DDBResultErrorKey,
  DDBResultSuccessKey,
  DDBResultType,
} from "./types";
import { typeDefinition } from "./utils";

const GetItemOptionsType = "GetItemOptions";
const ErrorMessage = "Unknown get item error";

/**
 * Reduced get item options. Based on GetItemInput of AWS sdk
 */
export const GetItemOptions = `
  type ${GetItemOptionsType} = Omit<${DocumentClient}.GetItemInput, "TableName" | "Key">;
`;

const generic = "T";

/**
 * Creates the GetItem function
 * @param table Cloudformation table resource
 * @returns GetItem function definition as a string
 */
export const createGetItem = (table: DynamoDBResource): string | undefined => {
  const { TableName, AttributeDefinitions, KeySchema } = table.Properties;

  const funcName = `get${camelcase(TableName, { pascalCase: true })}`;

  const hashKey = KeySchema.find((key) => key.KeyType === "HASH");
  if (!hashKey) {
    throw new Error(`Missing hash key for table: "${TableName}"`);
  }

  // Retrieve the type of the primary key
  const hashKeyType = typeDefinition(
    hashKey.AttributeName,
    AttributeDefinitions,
    true
  );

  if (!hashKeyType) {
    throw new Error(
      `Missing attribute definitions for hash key: "${hashKey.AttributeName}" in table: "${TableName}"`
    );
  }

  const args = [
    { name: hashKey.AttributeName, type: hashKeyType },
    { name: "options", type: GetItemOptionsType, optional: true },
  ];

  const body = `
    const res = await ${dbClient}
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
  `;

  return buildFunction({
    args,
    body,
    name: funcName,
    generics: [generic],
    returnType: `${DDBResultType}<${generic}>`,
    async: true,
  });
};
