import {
	apiCreateAccount,
	apiSelf,
	apiAssociate,
	services,
	apiLookup,
} from "./apis";
import { Hono } from "hono";

const serviceList = Object.entries(services) as [
	keyof typeof services,
	KVNamespace,
][];

const hono = new Hono();

hono.get("/self/:id", (c) =>
	apiSelf(c.req.header("Authorization"), c.req.param("id")),
);

for (const [srv, kv] of serviceList) {
	hono.get(`/lookup/${srv}/:id`, (c) => apiLookup(srv, kv, c.req.param("id")));

	hono.post(`/assoc/${srv}/:tzdbid/:serviceid`, (c) =>
		apiAssociate(
			srv,
			kv,
			c.req.header("Authorization"),
			c.req.param("tzdbid"),
			c.req.param("serviceid"),
		),
	);
}

hono.post("/create/:origin/:offset", (c) =>
	apiCreateAccount(c.req.param("origin"), c.req.param("offset")),
);

hono.get("/debuglist", async (c) => c.json(await KV_ACCOUNTS.list()));

addEventListener("fetch", (e) => e.respondWith(hono.fetch(e.request)));
