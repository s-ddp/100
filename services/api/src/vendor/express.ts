import http from "node:http";

type Handler = (...args: any[]) => any;

type Layer =
  | { type: "mw"; fn: Handler }
  | { type: "rt"; method: string; path: string; handler: Handler };

function createResponse(res: any) {
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload: unknown) => {
    if (!res.getHeader("Content-Type")) {
      res.setHeader("Content-Type", "application/json");
    }
    res.end(JSON.stringify(payload));
  };
  return res;
}

function matchPath(pattern: string, url: string) {
  const params: Record<string, string> = {};
  const patternParts = pattern.split("/").filter(Boolean);
  const urlParts = url.split("/").filter(Boolean);
  if (patternParts.length !== urlParts.length) return null;
  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];
    const u = urlParts[i];
    if (p.startsWith(":")) {
      params[p.slice(1)] = decodeURIComponent(u);
    } else if (p !== u) {
      return null;
    }
  }
  return params;
}

export function Router() {
  const routes: Layer[] = [];
  const middlewares: Layer[] = [];

  const router: any = function (req: any, res: any, outNext?: Handler) {
    createResponse(res);
    let idx = 0;
    let currentError: unknown;

    const stack: Layer[] = [...middlewares, ...routes];

    function next(err?: unknown) {
      if (typeof err !== "undefined") {
        currentError = err;
      }

      const layer = stack[idx++];
      if (!layer) return outNext && outNext(currentError);
      try {
        if (layer.type === "mw") {
          if ((layer.fn as any).length >= 4) {
            if (typeof currentError === "undefined") return next();
            return layer.fn(currentError, req, res, next);
          }
          if (currentError) {
            return next(currentError);
          }
          return layer.fn(req, res, next);
        }
        if (currentError) return next(currentError);
        if (layer.method && layer.method !== req.method) return next(currentError);
        const params = matchPath((layer as any).path, req.path || req.url || "");
        if (!params) return next(currentError);
        req.params = params;
        return (layer as any).handler(req, res, next);
      } catch (error) {
        console.error("router error", error);
        if (outNext) return outNext(error);
        res.statusCode = 500;
        res.end("Internal error");
      }
    }

    next();
  };

  router.use = (pathOrFn: string | Handler, fn?: Handler) => {
    if (typeof pathOrFn === "string" && typeof fn === "function") {
      middlewares.push({
        type: "mw",
        fn: (req: any, res: any, next: Handler) => {
          const currentPath = req.path || req.url || "";
          if (!currentPath.startsWith(pathOrFn)) return next();
          const originalPath = req.path;
          req.path = currentPath.slice(pathOrFn.length) || "/";
          fn(req, res, (err: unknown) => {
            req.path = originalPath;
            next(err);
          });
        },
      });
    } else if (typeof pathOrFn === "function") {
      middlewares.push({ type: "mw", fn: pathOrFn });
    }
  };

  router.get = (path: string, handler: Handler) => routes.push({ type: "rt", method: "GET", path, handler });
  router.post = (path: string, handler: Handler) => routes.push({ type: "rt", method: "POST", path, handler });

  return router;
}

function express() {
  const app: any = Router();

  app.listen = (port: number, host?: string, cb?: Handler) => {
    const server = http.createServer((req: any, res: any) => {
      const parsed = new URL(req.url ?? "", "http://localhost");
      req.path = parsed.pathname;
      const query: Record<string, string> = {};
      (parsed.searchParams as any).forEach((value: string, key: string) => {
        query[key] = value;
      });
      req.query = query;
      app(req, res, () => {
        if (!res.writableEnded) {
          res.statusCode = res.statusCode || 404;
          res.end("Not Found");
        }
      });
    });
    return server.listen(port, host, cb as any);
  };

  return app;
}

express.Router = Router;
express.json = function () {
  return function (req: any, res: any, next: Handler) {
    let data = "";
    req.on("data", (chunk: any) => {
      data += chunk;
    });
    req.on("end", () => {
      if (data.length > 0) {
        try {
          req.body = JSON.parse(data.toString());
        } catch (err) {
          res.statusCode = 400;
          return res.end("Invalid JSON");
        }
      }
      next();
    });
  };
};

export default express as any;
