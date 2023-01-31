import { createSessionToken, verifySessionTokenAndRespond } from "./auth";
import { createAccount, getAccount, saveAccount } from "./storage";
import { createTimezoneResponse, isValidTimezone } from "./timezones";
import { idFromCode, isSupportedService, services } from "./services";

async function getAccountAndRespond(id: string) {
	const account = await getAccount(id);
	return (
		account ?? new Response("There is no account with that ID", { status: 404 })
	);
}

export async function apiSelf(tok: string) {
	const id = await verifySessionTokenAndRespond(tok);
	if (id instanceof Response) return id;

	const account = await getAccountAndRespond(id);
	if (account instanceof Response) return account;

	return new Response(JSON.stringify(account));
}

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

export async function apiAssociate(
	service: keyof typeof services,
	kv: KVNamespace,
	reassoc: boolean,
	tok: string,
	serviceTok: string,
) {
	const acctId = await verifySessionTokenAndRespond(tok);
	if (acctId instanceof Response) return acctId;

	const account = await getAccountAndRespond(acctId);
	if (account instanceof Response) return account;

	const serviceId = await idFromCode(service, serviceTok);

	if (!serviceId)
		return new Response(
			`Either the given token was rejected by ${service}, or something broke`,
			{
				status: 401,
			},
		);

	const existingAssoc = await kv.get(serviceId);
	if (existingAssoc && existingAssoc !== acctId)
		return new Response(
			`This ${service} account is already linked to someone else`,
			{
				status: 403,
			},
		);

	if (!!existingAssoc !== reassoc)
		return new Response(
			reassoc
				? `You do not have a ${service} account linked, please use assoc`
				: `You already have a ${service} account linked, please use reassoc`,
			{ status: 400 },
		);

	await kv.put(serviceId, acctId);

	await saveAccount(acctId, {
		...account,
		services: {
			...account.services,
			[service]: serviceId,
		},
	});

	return new Response(undefined, { status: 201 });
}

export async function apiDissociate(
	service: keyof typeof services,
	kv: KVNamespace,
	tok: string,
) {
	const acctId = await verifySessionTokenAndRespond(tok);
	if (acctId instanceof Response) return acctId;

	const account = await getAccountAndRespond(acctId);
	if (account instanceof Response) return account;

	if (!account.services[service])
		return new Response(`You do not have a ${service} account linked`, {
			status: 400,
		});

	if (Object.keys(account.services).length === 1)
		return new Response(
			"You cannot dissociate your only linked account, as this would make your account inaccessible.",
			{ status: 403 },
		);

	const newAcct = {
		...account,
		services: { ...account.services },
	};
	delete newAcct.services[service];

	await kv.delete(account.services[service]!);

	await saveAccount(acctId, newAcct);

	return new Response(undefined, { status: 204 });
}

export async function apiCreateAccount(
	originRaw: string,
	offsetRaw: string,
	service: string,
	serviceTok: string,
) {
	// TODO turnstile this

	const origin = originRaw.toUpperCase();

	if (!isValidTimezone(origin))
		return new Response("Provide a valid origin for your TZ", { status: 400 });

	const offset = parseFloat(offsetRaw);
	if (!Number.isFinite(offset))
		return new Response("Provide an valid offset", { status: 400 });

	if (!isSupportedService(service))
		return new Response(`${service} is not a supported service`, {
			status: 400,
		});

	const kv = services[service]!.kv;

	const serviceId = await idFromCode(service, serviceTok);

	if (!serviceId)
		return new Response(
			`Either the given token was rejected by ${service}, or something broke`,
			{
				status: 401,
			},
		);

	if (await kv.get(serviceId))
		return new Response(
			`We logged into ${service} successfully, but you cannot create an TZDB account with this external account because it is linked to someone else`,
			{ status: 401 },
		);

	const newAccount = await createAccount({
		origin,
		offset,
		services: {
			[service]: serviceId,
		},
	});

	await kv.put(serviceId, newAccount.id);

	const sessionToken = await createSessionToken(newAccount.id);

	return new Response(sessionToken, {
		status: 201,
	});
}
