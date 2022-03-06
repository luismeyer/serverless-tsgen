import { Logger } from "../Logger";

export const S3 = "S3";
export const s3Client = "s3Client";

/**
 * Creates the s3 import
 * @param region AWS region
 * @returns Import and service declaration node
 */
export const createS3Import = (region?: string): string => {
  Logger.log("debug", "Creating s3 imports");

  const options = JSON.stringify({ region });

  return `
    import { ${S3} } from "aws-sdk";
    const ${s3Client} = new ${S3}(${options});
  `;
};
