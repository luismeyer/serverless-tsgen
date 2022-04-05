import { GlobalSecondaryIndexInfo } from "aws-sdk/clients/dynamodb";

import { Logger } from "../Logger";
import { DynamoDBResource } from "../types";
import { buildFunction, FunctionArg } from "../typescript/function";
import { dbClient, DocumentClient } from "./import";
import { camelCase, NameVariable } from "./name";

const QueryItemOptionsType = "QueryItemsOptions";

/**
 * Reduced get item options. Based on QueryInput of AWS sdk
 */
export const QueryItemsOptions = `
  type ${QueryItemOptionsType} = Omit<${DocumentClient}.QueryInput, "TableName" | "IndexName">;
`;

type CreateQueryGSIOptions = {
  tableName: NameVariable;
  indexName: NameVariable;
  tableResource: DynamoDBResource;
  indexInfo: GlobalSecondaryIndexInfo;
};

export const createQueryGSI = ({
  tableName,
  indexName,
  tableResource: {
    Properties: { TableName },
  },
  indexInfo: { IndexName },
}: CreateQueryGSIOptions): string => {
  if (!IndexName) {
    throw new Error(
      `Missing global secondary index name in table: "${TableName}"`
    );
  }

  Logger.log(
    "debug",
    `Creating DynamoDB queryGSI function for index: "${IndexName}"`
  );

  const funcName = camelCase("query", TableName, IndexName);

  const optionsIdentifier = "options";
  // arguments of the functions
  const args: FunctionArg[] = [
    { name: optionsIdentifier, type: QueryItemOptionsType },
  ];

  const body = `
    return ${dbClient}
      .query({ ...${optionsIdentifier}, TableName: ${tableName.identifier}, IndexName: ${indexName.identifier} })
      .promise();
  `;

  return buildFunction({
    args,
    body,
    name: funcName,
    async: true,
  });
};
