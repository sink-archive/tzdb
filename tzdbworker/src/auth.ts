export async function createSessionToken(id: string) {
	const tok = crypto.randomUUID().replaceAll("-", "");
	await refreshSessionToken(tok, id);

	return tok;
}

const refreshSessionToken = (tok: string, id: string) =>
	KV_SESSIONS.put(tok, id, {
		expirationTtl: 60 * 30, // 30 mins
	});

export const verifySessionToken = async (tok: string, refresh = true) => {
	const id = await KV_SESSIONS.get(tok);
	if (id && refresh) await refreshSessionToken(tok, id);
	return id ?? false;
};

export async function verifySessionTokenAndRespond(tok: string) {
	const verificationResult = await verifySessionToken(tok);
	if (verificationResult) return verificationResult;

	return new Response("That session token was invalid.", { status: 401 });
}
