import { getLuisLaraFrontend } from "./serverless";

const run = async () => {
  const result = await getLuisLaraFrontend({ Key: "bundle.js" });

  console.log("Get result ", result);
};

run();
