import { verifySessionTokenAndRespond } from "./auth";
import { createAccount, getAccount, saveAccount } from "./storage";
import { createTimezoneResponse, isValidTimezone } from "./timezones";

export const services = {
	discord: KV_DISCORD,
} as const;

export async function apiLookup(
	service: keyof typeof services,
	kv: KVNamespace,
	id: string,
) {
	const acctId = await kv.get(id);
	if (!acctId)
		return new Response(`There is no account found for this ${service} ID`, {
			status: 404,
		});

	const account = await getAccount(acctId);
	if (!account)
		return new Response(
			`Aw crap, our database desynced (not good).
Please email yellowsink@riseup.net and provide the following information, thanks.

TZDB: KV desync
operation: lookup
service: ${service}
service id: ${id}
supposed account id: ${acctId}`,
			{ status: 500 },
		);

	return new Response(JSON.stringify(createTimezoneResponse(account)));
}

export async function apiSelf(tok: string, id: string) {
	const res = verifySessionTokenAndRespond(tok);
	if (res !== true) return res;

	const account = await getAccount(id);
	if (!account)
		return new Response("There is no account with that ID", { status: 404 });

	return new Response(JSON.stringify(account));
}

export async function apiAssociate(
	service: keyof typeof services,
	kv: KVNamespace,
	tok: string,
	acctId: string,
	serviceId: string,
) {
	const res = verifySessionTokenAndRespond(tok);
	if (res !== true) return res;

	const account = await getAccount(acctId);
	if (!account)
		return new Response("There is no account with that ID", { status: 404 });

	const existingAssoc = await kv.get(serviceId);
	if (existingAssoc && existingAssoc !== acctId)
		return new Response(
			`This ${service} account is already linked to someone else`,
			{ status: 403 },
		);

	await kv.put(serviceId, acctId);

	await saveAccount(acctId, {
		...account,
		[service]: serviceId,
	});

	return new Response();
}

export async function apiCreateAccount(originRaw: string, offsetRaw: string) {
	const origin = originRaw.toUpperCase();

	if (!isValidTimezone(origin))
		return new Response("Provide a valid origin for your TZ", { status: 400 });

	const offset = parseFloat(offsetRaw);
	if (!Number.isFinite(offset))
		return new Response("Provide an valid offset", { status: 400 });

	return new Response(JSON.stringify(await createAccount({ origin, offset })));
}
