import {
  getQzmkrTable,
  queryQzmkrTableNameBirthIndex,
  queryQzmkrTableNameIndex,
} from "./serverless";

const run = async () => {
  const getResponse = await getQzmkrTable("1");

  if (getResponse.success) {
    console.log("Get user ", getResponse.data);
  }

  const queryResponse = await queryQzmkrTableNameIndex("frank");

  if (queryResponse.success) {
    console.log("Query users ", queryResponse.data);
  }

  const secondQueryResponse = await queryQzmkrTableNameBirthIndex(12, "lynn");

  if (secondQueryResponse.success) {
    console.log("Query users ", secondQueryResponse.data);
  }
};

run();
