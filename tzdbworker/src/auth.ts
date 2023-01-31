export async function createSessionToken(id: string) {
	const tok = crypto.randomUUID().replaceAll("-", "");
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
