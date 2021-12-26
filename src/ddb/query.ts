import { GlobalSecondaryIndexInfo } from "aws-sdk/clients/dynamodb";
import camelcase from "camelcase";

import { log } from "../logger";
import { DynamoDBResource } from "../types";
import { dbClient, DocumentClient } from "./import";
import {
  DDBResultDataKey,
  DDBResultErrorKey,
  DDBResultSuccessKey,
} from "./types";
import {
  createKeyConditionExpression,
  createNameExpression,
  createValueExpression,
  typeDefinition,
} from "./utils";

const QueryItemsOptions = "QueryItemsOptions";

const ErrorMessage = "Query item error";

/**
 * Reduced get item options. Based on GetItemInput of AWS sdk
 */
export const QueryItemOptionsType = `
  type ${QueryItemsOptions} = Omit<${DocumentClient}.QueryInput, "TableName" | "IndexName">;
`;

const generic = "T";
export const createQueryGSI = (
  table: DynamoDBResource,
  { IndexName, KeySchema }: GlobalSecondaryIndexInfo
): string | undefined => {
  const {
    Properties: { TableName, AttributeDefinitions },
  } = table;

  if (!IndexName) {
    throw new Error(
      `Missing index name in table: ${table.Properties.TableName}`
    );
  }

  const parsedIndexName = camelcase(IndexName, { pascalCase: true });
  const parsedTablename = camelcase(TableName, { pascalCase: true });
  const funcName = `query${parsedTablename}${parsedIndexName}`;

  if (!KeySchema) {
    return void log("warning", `Missing key schema for ${IndexName}`);
  }

  let hash: string | undefined;
  let hashType: string | undefined;

  let range: string | undefined;
  let rangeType: string | undefined;

  // read the gsi information
  KeySchema.forEach((schema) => {
    if (schema.KeyType === "HASH") {
      hash = schema.AttributeName;
      hashType = typeDefinition(hash, AttributeDefinitions, true) ?? "";
    }

    if (schema.KeyType === "RANGE") {
      range = schema.AttributeName;
      rangeType = typeDefinition(range, AttributeDefinitions, true) ?? "";
    }
  });

  if (!hash) {
    throw new Error(`Missing hash key in global secondary index: ${IndexName}`);
  }

  if (!hashType) {
    throw new Error(
      `Missing hash key in attribute definitions for global secondary index: ${IndexName}`
    );
  }

  if (range && !rangeType) {
    throw new Error(
      `Missing range key in attribute definitions for global secondary index: ${IndexName}`
    );
  }

  // extra argument if a range key is given
  let rangeArg = "";

  let rangeNameExp = "";
  let rangeValueExp = "";

  let optionalExpKeys: string[] = [];

  if (range) {
    rangeArg = `, ${range}?: ${rangeType}`;

    const rangeName = createNameExpression(range);
    const rangeValue = createValueExpression(range);

    /**
     * checks the range argument at runtime so no unnecessary
     * arguments get passed into aws-sdk
     */
    rangeNameExp = `...(${range} ? { ${rangeName} } : {})`;
    rangeValueExp = `...(${range} ? { ${rangeValue} } : {})`;

    optionalExpKeys = [range];
  }

  // arguments of the functions
  const args = `${hash}: ${hashType} ${rangeArg}, options?: ${QueryItemsOptions}`;

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
    optionalExpKeys
  );

  return `
    export async function ${funcName}<${generic}>(${args}): Promise<DDBResult<${generic}[]>> {

      const res = await ${dbClient}
        .query({
          ...options,
          TableName: "${TableName}", 
          IndexName: "${IndexName}",
          ExpressionAttributeNames: ${expressionAttributeNames},
          ExpressionAttributeValues: ${expressionAttributeValues},
          KeyConditionExpression: \`${keyConditionExpression}\`
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
    }`;
};
