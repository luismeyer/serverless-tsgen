import { Serverless } from "./types/serverless";

export type ChainLink = {
  canHandle: (sls: Serverless) => boolean;
  handle: (sls: Serverless) => void;
};

export class Chain {
  _links: ChainLink[] = [];

  addLink(link: ChainLink) {
    this._links = [...this._links, link];
    return this;
  }

  execute(serverless: Serverless) {
    this._links.forEach((link) => {
      if (!link.canHandle(serverless)) {
        return;
      }

      link.handle(serverless);
    });
  }
}
