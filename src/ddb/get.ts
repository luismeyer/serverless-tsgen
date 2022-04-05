import { Logger } from "../Logger";
import { DynamoDBResource } from "../types";
import { buildFunction, FunctionArg } from "../typescript/function";
import { dbClient, DocumentClient } from "./import";
import { camelCase, NameVariable } from "./name";
import { typeDefinition } from "./utils";

const GetItemOptionsType = "GetItemOptions";

/**
 * Reduced get item options. Based on GetItemInput of AWS sdk
 */
export const GetItemOptions = `
  type ${GetItemOptionsType} = Omit<${DocumentClient}.GetItemInput, "TableName">;
`;

/**
 * Creates the GetItem function
 * @param table Cloudformation table resource
 * @returns GetItem function definition as a string
 */
export const createGetItem = (
  tableName: NameVariable,
  table: DynamoDBResource
): string | undefined => {
  const { TableName, AttributeDefinitions, KeySchema } = table.Properties;
  Logger.log(
    "debug",
    `Creating DynamoDB getItem function for table "${TableName}"`
  );

  const funcName = camelCase("get", TableName);

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

  const optionsIdentifier = "options";

  const arg: FunctionArg = {
    name: optionsIdentifier,
    type: GetItemOptionsType,
  };

  const body = `
    return ${dbClient}.get({ ...${optionsIdentifier}, TableName: ${tableName.identifier} }).promise();
  `;

  return buildFunction({
    args: [arg],
    body,
    name: funcName,
    async: true,
  });
};
