import { log } from "./logger";
import { Serverless } from "./types/serverless";

export type ChainLink = {
  name: string;
  canHandle: (sls: Serverless) => boolean;
  handle: (sls: Serverless) => void;
};

export class Chain {
  _links: ChainLink[] = [];

  append(link: ChainLink) {
    this._links = [...this._links, link];
    return this;
  }

  execute(serverless: Serverless) {
    log("debug", "Iterating tsgen links");

    this._links.forEach((link) => {
      if (!link.canHandle(serverless)) {
        log("debug", `${link.name} can't handle serverless.yml`);
        return;
      }

      log("debug", `Handling ${link.name} tsgen link`);
      link.handle(serverless);
    });
  }
}
