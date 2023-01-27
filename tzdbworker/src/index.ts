import { getAccount, createAccount } from "./storage";

addEventListener("fetch", (e) => e.respondWith(handleRequest(e.request)));

async function handleRequest(req: Request): Promise<Response> {
  //await createAccount({ origin: "GMT", offset: 0 });
  return new Response(JSON.stringify(await getAccount("0")));
  //return new Response("Hello, World!");
}
