import { Logger } from "../Logger";
import { Serverless } from "../types/serverless";
import { ChainLink } from "./chain-link";

/**
 * Utility to simplify the chain setup. Instead
 * plugging the chainlinks into each other this
 * class can be used to reduce complexity
 */
export class Chain {
  private firstChainLink: ChainLink | undefined;
  private latestChainLink: ChainLink | undefined;

  public keys: string[] = [];

  public append(link: ChainLink) {
    this.keys = [...this.keys, link.key];

    // init the links on first append
    if (!this.firstChainLink || !this.latestChainLink) {
      this.firstChainLink = link;
      this.latestChainLink = link;

      return this;
    }

    // add the chainlink to the chain and mark it as latest
    this.latestChainLink.setNext(link);
    this.latestChainLink = link;

    return this;
  }

  /**
   * Send the Config through the chain by passing
   * it to the first chainlink
   * @param serverless Config
   * @returns void
   */
  public execute(serverless: Serverless) {
    if (!this.firstChainLink) {
      return Logger.log("error", "Missing start link in chain");
    }

    Logger.log("debug", "Executing chain");

    this.firstChainLink?.process(serverless);
  }
}
