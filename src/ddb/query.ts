import { GlobalSecondaryIndexInfo } from "aws-sdk/clients/dynamodb";
import camelcase from "camelcase";

import { log } from "../logger";
import { DynamoDBResource } from "../types";
import { buildFunction, FunctionArg } from "../typescript/function";
import { dbClient, DocumentClient } from "./import";
import {
  DDBResultDataKey,
  DDBResultErrorKey,
  DDBResultSuccessKey,
  DDBResultType,
} from "./types";
import {
  createKeyConditionExpression,
  createNameExpression,
  createValueExpression,
  typeDefinition,
} from "./utils";

const QueryItemsOptions = "QueryItemsOptions";

const ErrorMessage = "Unknown query item error";

/**
 * Reduced get item options. Based on QueryInput of AWS sdk
 */
export const QueryItemOptionsType = `
  type ${QueryItemsOptions} = Omit<${DocumentClient}.QueryInput, "TableName" | "IndexName">;
`;

const generic = "T";

export const createQueryGSI = (
  { Properties: { TableName, AttributeDefinitions } }: DynamoDBResource,
  { IndexName, KeySchema }: GlobalSecondaryIndexInfo
): string => {
  if (!IndexName) {
    throw new Error(
      `Missing global secondary index name in table: "${TableName}"`
    );
  }

  log("debug", `Creating DynamoDB queryGSI function for index: "${IndexName}"`);

  const parsedIndexName = camelcase(IndexName, { pascalCase: true });
  const parsedTablename = camelcase(TableName, { pascalCase: true });
  const funcName = `query${parsedTablename}${parsedIndexName}`;

  if (!KeySchema) {
    throw new Error(
      `Missing key schema for global secondary index: "${IndexName}"`
    );
  }

  let hash: string | undefined;
  let hashType: string | undefined;

  let range: string | undefined;
  let rangeType: string | undefined;

  // read the gsi information
  KeySchema.forEach((schema) => {
    if (schema.KeyType === "HASH") {
      hash = schema.AttributeName;
      hashType = typeDefinition(hash, AttributeDefinitions, true);
    }

    if (schema.KeyType === "RANGE") {
      range = schema.AttributeName;
      rangeType = typeDefinition(range, AttributeDefinitions, true);
    }
  });

  if (!hash) {
    throw new Error(
      `Missing hash key in global secondary index: "${IndexName}"`
    );
  }

  if (!hashType) {
    throw new Error(
      `Missing attribute definition for hash key: "${hash}" in global secondary index: "${IndexName}" in table: "${TableName}"`
    );
  }

  if (range && !rangeType) {
    throw new Error(
      `Missing attribute definition for range key "${range}" in global secondary index: "${IndexName}" in table "${TableName}"`
    );
  }

  // extra argument if a range key is given
  let rangeArg: FunctionArg[] = [];

  let rangeNameExp = "";
  let rangeValueExp = "";

  let optionalConditionKeys: string[] = [];

  /**
   * if a range key is given in the gsi definition
   * we still have to implement the query without a
   * range key since ddb allows it. So we have to check
   * the range key at generationtime and at runtime
   */
  if (range) {
    rangeArg = [{ name: range, type: rangeType ?? "", optional: true }];

    const rangeName = createNameExpression(range);
    const rangeValue = createValueExpression(range);

    /**
     * checks the range argument at runtime so no unnecessary
     * arguments get passed into aws-sdk
     */
    rangeNameExp = `...(${range} ? { ${rangeName} } : {})`;
    rangeValueExp = `...(${range} ? { ${rangeValue} } : {})`;

    // add the range key to the condition expression
    optionalConditionKeys = [range];
  }

  // arguments of the functions
  const args: FunctionArg[] = [
    { name: hash, type: hashType },
    ...rangeArg,
    { name: "options", type: QueryItemsOptions, optional: true },
  ];

  const expressionAttributeNames = `{
    ${createNameExpression(hash)},
    ${rangeNameExp}
  }`;

  const expressionAttributeValues = `{
    ${createValueExpression(hash)},
    ${rangeValueExp}
  }`;

  const keyConditionExpression = createKeyConditionExpression(
    [hash],
    optionalConditionKeys
  );

  const body = `
    const res = await ${dbClient}
      .query({
        ...options,
        TableName: "${TableName}", 
        IndexName: "${IndexName}",
        ExpressionAttributeNames: ${expressionAttributeNames},
        ExpressionAttributeValues: ${expressionAttributeValues},
        KeyConditionExpression: ${keyConditionExpression}
      })
      .promise();

    if (res.$response.error || !res.Items?.length) {
      return {
        ${DDBResultSuccessKey}: false,
        ${DDBResultErrorKey}: res.$response.error
          ? res.$response.error.message
          : "${ErrorMessage}",
      };
    }

    return {
      ${DDBResultSuccessKey}: true,
      ${DDBResultDataKey}: res.Items as ${generic}[],
    };
  `;

  return buildFunction({
    args,
    body,
    name: funcName,
    returnType: `${DDBResultType}<${generic}[]>`,
    generics: [generic],
    async: true,
  });
};
