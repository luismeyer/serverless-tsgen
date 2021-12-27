export type FunctionArg = {
  name: string;
  type: string;
  optional?: boolean;
};

export type FunctionSignatureOptions = {
  name: string;
  args: FunctionArg[];
  returnType: string;
  async?: boolean;
  generics?: string[];
};

/**
 * Builds a function signature. The signature starts with the
 * export keyword and ends before the curly bracket opening
 * the function body block
 * @param param0 information to build signature
 * @returns function signature string
 */
const buildFunctionSignature = ({
  name,
  returnType,
  async,
  args,
  generics,
}: FunctionSignatureOptions) => {
  const asyncModifier = async ? "async" : "";
  const completeReturnType = async ? `Promise<${returnType}>` : returnType;

  const parsedArgs = args
    .map((arg) => `${arg.name}${arg.optional ? "?" : ""}: ${arg.type}`)
    .join(",");

  const parsedGenerics = generics ? `<${generics.join(",")}>` : "";

  return `
    export ${asyncModifier} function ${name}${parsedGenerics}(${parsedArgs}): ${completeReturnType}
  `;
};

export type FunctionOptions = FunctionSignatureOptions & {
  body: string;
};

/**
 * Builds a function string. Specifically tailored for our problems
 * to keep the code simpler
 * @param options minimal information for function
 * @returns function string
 */
export const buildFunction = (options: FunctionOptions) => {
  const signature = buildFunctionSignature(options);

  return `${signature} {
    ${options.body}
  }`;
};
