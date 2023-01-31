import {
	apiCreateAccount,
	apiSelf,
	apiAssociate,
	apiLookup,
	apiDissociate,
} from "./apis";
import { tzsByOffset, tzKeywords, tzOffsetsByKey } from "./timezones";
import { Hono } from "hono";
import { Service } from "./types";
import { services } from "./services";

const serviceList = Object.entries(services) as [
	keyof typeof services,
	Service,
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

for (const [sName, srv] of serviceList) {
	hono.get(`/${sName}/lookup/:id`, (c) =>
		apiLookup(sName, srv.kv, c.req.param("id")),
	);

	hono.post(`/${sName}/assoc/:serviceid`, (c) =>
		apiAssociate(
			sName,
			srv.kv,
			false,
			c.req.header("Authorization"),
			c.req.param("serviceid"),
		),
	);

	hono.post(`/${sName}/reassoc/:serviceid`, (c) =>
		apiAssociate(
			sName,
			srv.kv,
			true,
			c.req.header("Authorization"),
			c.req.param("serviceid"),
		),
	);

	hono.post(`/${sName}/deassoc`, (c) =>
		apiDissociate(sName, srv.kv, c.req.header("Authorization")),
	);
}

hono.post("/acct/create", (c) =>
	apiCreateAccount(c.req.query("origin"), c.req.query("offset")),
);

// TODO implement more APIs

hono.get("/debuglist", async (c) => c.json(await KV_ACCOUNTS.list()));

addEventListener("fetch", (e) => e.respondWith(hono.fetch(e.request)));
