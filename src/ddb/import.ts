import { Logger } from "../Logger";

export const DocumentClient = "DocumentClient";
export const dbClient = "ddbClient";

/**
 * Creates ddb import statement
 * @param region AWS region
 * @returns Import and service declaration node
 */
export const createDDBImport = (region?: string): string => {
  Logger.log("debug", "Creating DynamoDB imports");

  const options = JSON.stringify({ region });

  return `
    import { ${DocumentClient} } from "aws-sdk/clients/dynamodb";
    const ${dbClient} = new ${DocumentClient}(${options});
  `;
};
