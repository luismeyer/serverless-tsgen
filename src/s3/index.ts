import { Generator } from "../Generator";
import { Logger } from "../Logger";
import { ChainLink } from "../models/chain-link";
import { createNameVariable } from "../name";
import { isS3Resource, Serverless } from "../types";
import { createGetObject, GetObjectOptions } from "./get";
import { createS3Import } from "./import";

function processS3(serverless: Serverless) {
  Logger.log("debug", "Handling s3 resources");

  const { service } = serverless;

  if (!service.resources) {
    return Logger.log("debug", "No cloudformation resources to handle");
  }

  // Creates import and setup s3Client
  const importStatement = createS3Import(service.provider?.region);

  Generator.instance.collectOutput(importStatement, GetObjectOptions);

  // Unwrap the cloudformation input
  const resourceDefs = Object.entries(service.resources.Resources);

  // Filter the resources
  const s3Buckets = resourceDefs.filter(
    ([_, def]) => def.Type === "AWS::S3::Bucket"
  );

  s3Buckets.forEach(([key, bucket]) => {
    if (!isS3Resource(bucket)) {
      return;
    }

    const { Properties } = bucket;

    Logger.log("debug", `Handling s3 resource ${key}`);

    if (!Properties.BucketName) {
      return Logger.log(
        "warning",
        `Missing BucketName for resource: "${key}". Cannot generate code for Buckets without a custom name.`
      );
    }

    const s3Name = createNameVariable(Properties.BucketName, "BUCKET");

    const getObject = createGetObject(s3Name, bucket);

    Generator.instance.collectOutput(s3Name.definition, getObject);
  });
}

export class S3ChainLink extends ChainLink {
  constructor() {
    super("s3", processS3);
  }
}
