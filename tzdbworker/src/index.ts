import {
	apiCreateAccount,
	apiSelf,
	apiAssociate,
	services,
	apiLookup,
	apiDissociate,
} from "./apis";
import { tzsByOffset, tzKeywords, tzOffsetsByKey } from "./timezones";
import { Hono } from "hono";

const serviceList = Object.entries(services) as [
	keyof typeof services,
	KVNamespace,
][];

const hono = new Hono();

hono.get("/tzlist", (c) =>
	c.json({
		tzsByOffset,
		tzKeywords,
		tzOffsetsByKey,
	}),
);

hono.get("/self", (c) => apiSelf(c.req.header("Authorization")));

for (const [srv, kv] of serviceList) {
	hono.get(`/${srv}/lookup/:id`, (c) => apiLookup(srv, kv, c.req.param("id")));

	hono.post(`/${srv}/assoc/:serviceid`, (c) =>
		apiAssociate(
			srv,
			kv,
			false,
			c.req.header("Authorization"),
			c.req.param("serviceid"),
		),
	);

	hono.post(`/${srv}/reassoc/:serviceid`, (c) =>
		apiAssociate(
			srv,
			kv,
			true,
			c.req.header("Authorization"),
			c.req.param("serviceid"),
		),
	);

	hono.post(`/${srv}/deassoc/:serviceid`, (c) =>
		apiDissociate(srv, kv, c.req.header("Authorization")),
	);
}

hono.post("/acct/create", (c) =>
	apiCreateAccount(c.req.query("origin"), c.req.query("offset")),
);

// TODO implement more APIs

hono.get("/debuglist", async (c) => c.json(await KV_ACCOUNTS.list()));

addEventListener("fetch", (e) => e.respondWith(hono.fetch(e.request)));
