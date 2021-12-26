/**
 * This File is copied from https://github.com/XappMedia/serverless-plugin-types
 * Since it seems like the repo isn't maintained anymore we copy the files
 * instead of using the npm package
 */

/**
 * Specified what items to include or exclude from the package.
 */
export type Package = {
  artifact?: string;
  include?: string[];
  exclude?: string[];
  individually?: boolean;
  excludeDevDependencies?: boolean;
};
