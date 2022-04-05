import { DocumentClient } from "aws-sdk/clients/dynamodb"
const ddbClient = new DocumentClient({ region: "eu-central-1" })

type QueryItemsOptions = Omit<
  DocumentClient.QueryInput,
  "TableName" | "IndexName"
>

type GetItemOptions = Omit<DocumentClient.GetItemInput, "TableName">

export async function getTest(options: GetItemOptions) {
  return ddbClient.get({ ...options, TableName: "Test" }).promise()
}

export async function queryTestNameBirthIndex(options: QueryItemsOptions) {
  return ddbClient
    .query({ ...options, TableName: "Test", IndexName: "nameBirthIndex" })
    .promise()
}

export async function queryTestNameIndex(options: QueryItemsOptions) {
  return ddbClient
    .query({ ...options, TableName: "Test", IndexName: "nameIndex" })
    .promise()
}
