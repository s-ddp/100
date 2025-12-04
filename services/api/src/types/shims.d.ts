declare module "express" {
  import { IncomingMessage, ServerResponse } from "node:http";

  export interface Request extends IncomingMessage {
    params?: Record<string, string>;
    body?: any;
    path?: string;
    query?: Record<string, string | undefined>;
  }

  export interface Response extends ServerResponse {
    status(code: number): this;
    json(payload: any): void;
  }

  export type NextFunction = (err?: unknown) => void;
  export type Handler = (...args: any[]) => any;

  export interface Router {
    (req: Request, res: Response, next?: NextFunction): void;
    use(path: string | Handler, handler?: Handler): void;
    get(path: string, handler: Handler): void;
    post(path: string, handler: Handler): void;
    listen?(port: number, host?: string, cb?: () => void): any;
  }

  export interface Express extends Router {}

  export interface ExpressFactory {
    (): Express;
    Router(): Router;
    json(): Handler;
  }

  const express: ExpressFactory;
  export default express;
  export function Router(): Router;
  export function json(): Handler;
}

declare module "cors" {
  import { Handler } from "express";
  export default function cors(): Handler;
}

declare module "@prisma/client" {
  export class PrismaClient {
    event: { findUnique(args: any): Promise<any> };
    seatLock: { create(args: any): Promise<any>; deleteMany(args: any): Promise<any> };
    order: {
      create(args: any): Promise<any>;
      findUnique(args: any): Promise<any>;
      update(args: any): Promise<any>;
    };
    orderItem: { create(args: any): Promise<any> };
    $disconnect(): Promise<void>;
  }
}

declare module "dotenv" {
  export function config(): void;
}

declare module "pino" {
  const pino: any;
  export default pino;
}

declare module "node:http" {
  export const createServer: any;
  export type IncomingMessage = any;
  export type ServerResponse = any;
}

declare module "node:test" {
  const test: any;
  export default test;
}

declare module "node:assert/strict" {
  const assert: any;
  export default assert;
}

declare module "node:fetch" {
  export default function fetch(input: any, init?: any): Promise<any>;
}

declare namespace NodeJS {
  interface Process {
    env: Record<string, string | undefined>;
    uptime(): number;
    exit(code?: number): void;
  }
}

declare const process: NodeJS.Process;
