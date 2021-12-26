import {
  AttributeDefinitions,
  BillingMode,
  GlobalSecondaryIndexes,
  KeySchema,
  LocalSecondaryIndexes,
} from "aws-sdk/clients/dynamodb";

export type DynamoDBResource = {
  Type: "AWS::DynamoDB::Table";
  DeletionPolicy: "Delete" | "Retain";
  Properties: {
    AttributeDefinitions: AttributeDefinitions;
    KeySchema: KeySchema;
    GlobalSecondaryIndexes: GlobalSecondaryIndexes;
    LocalSecondaryIndex: LocalSecondaryIndexes;
    BillingMode: BillingMode;
    TableName: string;
  };
};

/**
 * Collection of resources.
 */
export type Resources = {
  Resources: {
    [name: string]: DynamoDBResource;
  };
};
