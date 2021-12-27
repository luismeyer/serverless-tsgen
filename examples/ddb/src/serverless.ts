import { DocumentClient } from "aws-sdk/clients/dynamodb";
const ddbClient = new DocumentClient({ region: "eu-central-1" });

export type DDBSuccessResult<T> = {
  success: true;
  data: T;
};

export type DDBErrorResult = {
  success: false;
  error: string;
};

export type DDBResult<T> = DDBSuccessResult<T> | DDBErrorResult;

type GetItemOptions = Omit<DocumentClient.GetItemInput, "TableName" | "Key">;

type QueryItemsOptions = Omit<
  DocumentClient.QueryInput,
  "TableName" | "IndexName"
>;

export async function getQzmkrTable<T>(
  id: string,
  options?: GetItemOptions
): Promise<DDBResult<T>> {
  const res = await ddbClient
    .get({
      ...options,
      TableName: "qzmkr-table",
      Key: { id },
    })
    .promise();

  if (res.$response.error || !res.Item) {
    return {
      success: false,
      error: res.$response.error
        ? res.$response.error.message
        : "Unknown get item error",
    };
  }

  return {
    success: true,
    data: res.Item as T,
  };
}

export async function queryQzmkrTableNameBirthIndex<T>(
  birth: number,
  name?: string,
  options?: QueryItemsOptions
): Promise<DDBResult<T[]>> {
  const res = await ddbClient
    .query({
      ...options,
      TableName: "qzmkr-table",
      IndexName: "nameBirthIndex",
      ExpressionAttributeNames: {
        "#birth": "birth",
        ...(name ? { "#name": "name" } : {}),
      },
      ExpressionAttributeValues: {
        ":birth": birth,
        ...(name ? { ":name": name } : {}),
      },
      KeyConditionExpression:
        "#birth = :birth" + (name ? " and #name = :name" : ""),
    })
    .promise();

  if (res.$response.error || !res.Items?.length) {
    return {
      success: false,
      error: res.$response.error
        ? res.$response.error.message
        : "Unknown query item error",
    };
  }

  return {
    success: true,
    data: res.Items as T[],
  };
}

export async function queryQzmkrTableNameIndex<T>(
  name: string,
  options?: QueryItemsOptions
): Promise<DDBResult<T[]>> {
  const res = await ddbClient
    .query({
      ...options,
      TableName: "qzmkr-table",
      IndexName: "nameIndex",
      ExpressionAttributeNames: {
        "#name": "name",
      },
      ExpressionAttributeValues: {
        ":name": name,
      },
      KeyConditionExpression: "#name = :name",
    })
    .promise();

  if (res.$response.error || !res.Items?.length) {
    return {
      success: false,
      error: res.$response.error
        ? res.$response.error.message
        : "Unknown query item error",
    };
  }

  return {
    success: true,
    data: res.Items as T[],
  };
}
