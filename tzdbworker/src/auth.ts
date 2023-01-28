const sha512 = async (str: string) =>
	Array.prototype.map
		.call(
			new Uint8Array(
				await crypto.subtle.digest("SHA-512", new TextEncoder().encode(str)),
			),
			(x: number) => ("00" + x.toString(16)).slice(-2),
		)
		.join("");

export async function createSessionToken(id: string, ip: string) {
	const random = crypto.randomUUID();

	const tok = await sha512(random + ip);

	await KV_SESSIONS.put(tok, id, {
		expirationTtl: 60 * 30, // 30 mins
	});

	return tok;
}

export const verifySessionToken = async (tok: string) =>
	(await KV_SESSIONS.get(tok)) ?? false;

export async function verifySessionTokenAndRespond(tok: string) {
	const verificationResult = await verifySessionToken(tok);
	if (verificationResult) return verificationResult;

	return new Response("That session token was invalid.", { status: 401 });
}
