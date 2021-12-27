import {
  getQzmkrTable,
  queryQzmkrTableNameBirthIndex,
  queryQzmkrTableNameIndex,
} from "./serverless";

type User = {
  id: string;
  birth: number;
  name: string;
};

const run = async () => {
  const getResponse = await getQzmkrTable<User>("1");

  if (getResponse.success) {
    console.log("Get user ", getResponse.data);
  }

  const queryResponse = await queryQzmkrTableNameIndex<User>("frank");

  if (queryResponse.success) {
    console.log("Query users ", queryResponse.data);
  }

  const secondQueryResponse = await queryQzmkrTableNameBirthIndex<User>(12);

  if (secondQueryResponse.success) {
    console.log("Query users ", secondQueryResponse.data);
  }
};

run();
