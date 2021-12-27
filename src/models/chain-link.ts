import { log } from "../logger";
import { Serverless } from "../types";

type ProcessFc = (serverless: Serverless) => void;

/**
 * Part of the chain of responsibility. The chainlinks
 * process the config and pass it to the next link
 */
export abstract class ChainLink {
  // identifies the chain link
  public key: string;

  private next: ChainLink | undefined;
  private processFc: ProcessFc;

  constructor(key: string, processFc: ProcessFc) {
    this.key = key;

    this.processFc = processFc;
  }

  public setNext(link: ChainLink) {
    this.next = link;
  }

  private canProcess = ({ service }: Serverless) =>
    !service.custom?.tsgen?.resources ||
    service.custom.tsgen.resources.includes(this.key);

  public process(serverless: Serverless) {
    if (!this.canProcess(serverless)) {
      return log("debug", `${this.key} link can't handle serverless.yml`);
    }

    this.processFc(serverless);

    this.next?.process(serverless);
  }
}
