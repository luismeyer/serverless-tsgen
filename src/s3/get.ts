import { Logger } from "../Logger";
import { camelCase, NameVariable } from "../name";
import { S3Resource } from "../types";
import { buildFunction, FunctionArg } from "../typescript/function";
import { s3Client, S3 } from "./import";

const GetObjectType = "GetObjectOptions";

export const GetObjectOptions = `
  type ${GetObjectType} = Omit<${S3}.GetObjectRequest, "Bucket">;
`;

export const createGetObject = (
  bucketName: NameVariable,
  { Properties }: S3Resource
) => {
  if (!Properties.BucketName) {
    return "";
  }

  Logger.log(
    "debug",
    `Creating S3 getObject function for Bucket "${Properties.BucketName}"`
  );

  const name = camelCase("get", Properties.BucketName);

  const optionsArg = "options";
  const args: FunctionArg[] = [{ name: optionsArg, type: GetObjectType }];

  const body = `
    return ${s3Client}.getObject({ Bucket: ${bucketName.identifier}, ...${optionsArg} }).promise()
  `;

  return buildFunction({
    name,
    args,
    body,
  });
};
