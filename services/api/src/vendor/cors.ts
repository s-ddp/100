export default function cors() {
  return function (_req: any, res: any, next: any) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (typeof next === "function") next();
  };
}
