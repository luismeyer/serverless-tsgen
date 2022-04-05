import { AttributeDefinitions } from "aws-sdk/clients/dynamodb";

export const AWSKeyTypeMapping: Record<string, string> = {
  S: "string",
  N: "number",
  B: "string",
};

export const AWSTypeMapping: Record<string, string> = {
  ...AWSKeyTypeMapping,
  SS: "Set<string>",
  NS: "Set<number>",
  BS: "Set<string>",
  M: "Record<string, any>",
  L: "any[]",
  NULL: "null",
  BOOL: "boolean",
};

export const AWSKeyTypes = Object.keys(AWSKeyTypeMapping);
export const AWSTypes = Object.keys(AWSTypeMapping);

export const transformAWSType = (type: string, isKey?: boolean) => {
  const typeString = (isKey ? AWSKeyTypeMapping : AWSTypeMapping)[type];

  if (typeString) {
    return typeString;
  }

  const typeSuggestions = isKey ? AWSKeyTypes : AWSTypes.join(",");
  throw new Error(`
    Wrong attribute type. "${type}" isn't a valid type. Expected one of ${typeSuggestions}
  `);
};

/**
 * Searches the attribute type for given name
 * @param attributeName Name to get the type
 * @param attributeDefinitions All definitions
 * @returns TS type string
 */
export const typeDefinition = (
  attributeName: string,
  attributeDefinitions: AttributeDefinitions,
  isKey?: boolean
): string | undefined => {
  const definition = attributeDefinitions.find(
    ({ AttributeName }) => AttributeName === attributeName
  );

  if (!definition) {
    return;
  }

  return transformAWSType(definition.AttributeType, isKey);
};
