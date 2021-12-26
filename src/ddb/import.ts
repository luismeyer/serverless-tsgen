export const DocumentClient = "DocumentClient";
export const dbClient = "ddbClient";

/**
 * Creates this statements:
 * @param region AWS region
 * @returns Import and service decleration node
 */
export const createDDBImport = (region?: string): string => {
  const options = JSON.stringify({ region });

  return `
    import { ${DocumentClient} } from "aws-sdk/clients/dynamodb";
    const ${dbClient} = new ${DocumentClient}(${options});
  `;
};
