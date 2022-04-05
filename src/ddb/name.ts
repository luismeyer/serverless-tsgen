export type NameVariable = {
  definition: string;
  identifier: string;
};

const screamingSnakeCase = (name: string) => {
  const match = name.match(
    /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
  );

  if (!match) {
    return name.toUpperCase();
  }

  return match.map((x) => x.toUpperCase()).join("_");
};

export const createTableNameVariable = (tableName: string): NameVariable => {
  let identifier = screamingSnakeCase(tableName);

  if (!identifier.endsWith("TABLE")) {
    identifier = `${identifier}_TABLE`;
  }

  return {
    definition: `export const ${identifier} = "${tableName}"`,
    identifier,
  };
};

export const createIndexNameVariable = (indexName: string): NameVariable => {
  let identifier = screamingSnakeCase(indexName);

  if (!identifier.endsWith("INDEX")) {
    identifier = `${identifier}_INDEX`;
  }

  return {
    definition: `export const ${identifier} = "${indexName}"`,
    identifier,
  };
};

export const camelCase = (...strs: string[]) => {
  const str = strs.join("");

  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
};
