import { DocumentClient } from "aws-sdk/clients/dynamodb"
const ddbClient = new DocumentClient({ region: "eu-central-1" })

type QueryItemsOptions = Omit<
  DocumentClient.QueryInput,
  "TableName" | "IndexName"
>

type GetItemOptions = Omit<DocumentClient.GetItemInput, "TableName">

export const TEST_TABLE = "Test"

export async function getTest(options: GetItemOptions) {
  return ddbClient.get({ ...options, TableName: TEST_TABLE }).promise()
}
export const NAME_BIRTH_INDEX = "nameBirthIndex"

export async function queryTestnameBirthIndex(options: QueryItemsOptions) {
  return ddbClient
    .query({ ...options, TableName: TEST_TABLE, IndexName: NAME_BIRTH_INDEX })
    .promise()
}
export const NAME_INDEX = "nameIndex"

export async function queryTestnameIndex(options: QueryItemsOptions) {
  return ddbClient
    .query({ ...options, TableName: TEST_TABLE, IndexName: NAME_INDEX })
    .promise()
}
