import camel from "camelcase";

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

export const createNameVariable = (
  name: string,
  suffix?: string
): NameVariable => {
  let identifier = screamingSnakeCase(name);

  if (suffix && !identifier.endsWith(suffix)) {
    identifier = `${identifier}_${suffix.toUpperCase()}`;
  }

  return {
    definition: `export const ${identifier} = "${name}"`,
    identifier,
  };
};

export const camelCase = (...strs: string[]) => {
  const str = strs.reduce(
    (acc, curr) => acc + curr.slice(0, 1).toUpperCase() + curr.slice(1),
    ""
  );

  return camel(str);
};
