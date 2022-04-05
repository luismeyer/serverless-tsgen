import { GlobalSecondaryIndexInfo } from "aws-sdk/clients/dynamodb";
import camelcase from "camelcase";

import { Logger } from "../Logger";
import { DynamoDBResource } from "../types";
import { buildFunction, FunctionArg } from "../typescript/function";
import { dbClient, DocumentClient } from "./import";

const QueryItemOptionsType = "QueryItemsOptions";

/**
 * Reduced get item options. Based on QueryInput of AWS sdk
 */
export const QueryItemsOptions = `
  type ${QueryItemOptionsType} = Omit<${DocumentClient}.QueryInput, "TableName" | "IndexName">;
`;

export const createQueryGSI = (
  { Properties: { TableName } }: DynamoDBResource,
  { IndexName }: GlobalSecondaryIndexInfo
): string => {
  if (!IndexName) {
    throw new Error(
      `Missing global secondary index name in table: "${TableName}"`
    );
  }

  Logger.log(
    "debug",
    `Creating DynamoDB queryGSI function for index: "${IndexName}"`
  );

  const parsedIndexName = camelcase(IndexName, { pascalCase: true });
  const parsedTablename = camelcase(TableName, { pascalCase: true });
  const funcName = `query${parsedTablename}${parsedIndexName}`;

  const optionsIdentifier = "options";
  // arguments of the functions
  const args: FunctionArg[] = [
    { name: optionsIdentifier, type: QueryItemOptionsType },
  ];

  const body = `
    return ${dbClient}
      .query({ ...${optionsIdentifier}, TableName: "${TableName}", IndexName: "${IndexName}" })
      .promise();
  `;

  return buildFunction({
    args,
    body,
    name: funcName,
    async: true,
  });
};
