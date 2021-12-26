export const DDBSuccessType = "DDBSuccessResult";
const DDBSuccessParam = "T";

export const DDBErrorType = "DDBErrorResult";

export const DDBResultType = "DDBResult";

export const DDBResultSuccessKey = "success";
export const DDBResultDataKey = "data";
export const DDBResultErrorKey = "error";

export const createDDBTypes = (): string => {
  return `
    export type ${DDBSuccessType}<${DDBSuccessParam}> = {
      ${DDBResultSuccessKey}: true;
      ${DDBResultDataKey}: ${DDBSuccessParam};
    };

    export type ${DDBErrorType} = {
      ${DDBResultSuccessKey}: false;
      ${DDBResultErrorKey}: string;
    };

    export type ${DDBResultType}<${DDBSuccessParam}> = ${DDBSuccessType}<${DDBSuccessParam}> | ${DDBErrorType};
  `;
};
