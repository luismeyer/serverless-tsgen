import {
  getTest,
  queryTestNameIndex,
  queryTestNameBirthIndex,
} from "./serverless";

const run = async () => {
  const getResponse = await getTest({ Key: { id: "123" } });

  if (getResponse.Item) {
    console.log("Get user ", getResponse.Item);
  }

  const queryResponse = await queryTestNameIndex({
    ExpressionAttributeNames: { "#name": "name" },
    ExpressionAttributeValues: { ":name": "luis" },
    KeyConditionExpression: `#name = :name`,
  });

  if (queryResponse.Items) {
    console.log("Query users ", queryResponse.Items);
  }

  const secondQueryResponse = await queryTestNameBirthIndex({
    ExpressionAttributeValues: { ":birth": 100 },
    KeyConditionExpression: "birth = :birth",
  });

  if (secondQueryResponse.Items) {
    console.log("Query users ", secondQueryResponse.Items);
  }
};

run();
