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

export type S3Resource = {
  Type: "AWS::S3::Bucket";
  DeletionPolicy: "Delete" | "Retain";
  Properties: {
    BucketName?: string;
  };
};

export type AWSResource = DynamoDBResource | S3Resource;

export const isDynamoDBResource = (
  resource: AWSResource
): resource is DynamoDBResource => resource.Type === "AWS::DynamoDB::Table";

export const isS3Resource = (resource: AWSResource): resource is S3Resource =>
  resource.Type === "AWS::S3::Bucket";

/**
 * Collection of resources.
 */
export type Resources = {
  Resources: {
    [name: string]: AWSResource;
  };
};
