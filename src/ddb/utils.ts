import { AttributeDefinitions, KeySchema } from "aws-sdk/clients/dynamodb";
import { log } from "../logger";

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

  throw new Error(`
    Wrong attribute type. ${type} isn't a valid type. 
    Expected one of ${isKey ? AWSKeyTypes : AWSTypes.join(",")}
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
) => {
  const definition = attributeDefinitions.find(
    ({ AttributeName }) => AttributeName === attributeName
  );

  if (!definition) {
    throw new Error(`Missing attribute definition for ${attributeName}`);
  }

  return transformAWSType(definition.AttributeType, isKey);
};

/**
 * Turns a string key into a DDB-name-key
 * @param key Some key
 * @returns DDB string
 */
export const attributeNameKey = (key: string): string => `#${String(key)}`;

/**
 * Turns a string key into a DDB-value-key
 * @param key Some object key
 * @returns DDB string
 */
export const attributeValueKey = (key: string): string => `:${String(key)}`;

const createKeyCondition = (key: string) =>
  `${attributeNameKey(key)} = ${attributeValueKey(key)}`;

/**
 * Creates String to find items in DDB which
 * looks like this: '#key = :key and #key1 = :key1'
 * @param requiredKeys The Object-Keys that contain
 * @returns DDB String
 */
export const createKeyConditionExpression = (
  requiredKeys: string[],
  optionalKeys: string[] = []
): string => {
  const requiredCondition = requiredKeys
    .filter((key) => key.length > 0)
    .map(createKeyCondition)
    .join(" and ");

  let optionalCondition = "";

  if (optionalKeys.length) {
    const parsedOptionalKeys = optionalKeys
      .map((key) => `( ${key} ? " and ${createKeyCondition(key)}" : "" )`)
      .join(" + ");

    optionalCondition = " + " + parsedOptionalKeys;
  }

  return `"${requiredCondition}" ${optionalCondition}`;
};

/**
 * Creates a name expression which should be included
 * in the expressionAttributeNames for DDB requests
 * @param key column key
 * @returns string with a name expression
 */
export const createNameExpression = (key: string) =>
  `"${attributeNameKey(key)}": "${key}"`;

/**
 * Creates a value expression which should be included
 * in the expressionAttributeValues for DDB requests
 * @param key column key
 * @returns string with a name expression
 */
export const createValueExpression = (key: string) =>
  `"${attributeValueKey(key)}": ${key}`;
