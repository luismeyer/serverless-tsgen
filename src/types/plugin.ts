export type ObjOrPromise<T> = T | Promise<T>;

export type Hook =
  | "before:aws:common:validate:validate"
  | "after:aws:common:validate:validate"
  | "before:package:compileFunctions"
  | "after:package:compileFunctions"
  | "before:aws:deploy:deploy:createStack"
  | "after:aws:deploy:deploy:createStack"
  | "before:aws:deploy:deploy:updateStack"
  | "after:aws:deploy:deploy:updateStack";

export type Hooks = Partial<Record<Hook, ObjOrPromise<any>>> &
  Record<string, ObjOrPromise<any>>;

export type CommandOption = {
  usage: string;
  shortcut: string;
  required: boolean;
  type: "string" | "boolean" | "multiple";
};

export type Command = {
  usage: string;
  lifecycleEvents: string[];
  options?: Record<string, CommandOption>;
};

export abstract class ServerlessPlugin {
  hooks?: Hooks;
  commands?: Record<string, Command>;
}
