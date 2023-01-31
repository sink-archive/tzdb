// stores session tokens

type StoredToken = {
	token: string;
	addTime: number;
};

export function getSessionToken(bypassTimeCheck = false) {
	const storedTokenRaw = localStorage.getItem("sessiontoken");
	if (!storedTokenRaw) return;

	const storedToken: StoredToken = JSON.parse(storedTokenRaw);
	const maxStoreTime = 60 * 60; // 30 mins, like the server

	if (!bypassTimeCheck && storedToken.addTime + maxStoreTime >= Date.now()) {
		localStorage.removeItem("sessiontoken");
		return;
	}

	return storedToken.token;
}

export function updateToken(tok?: string) {
	tok ??= getSessionToken(true);
	if (!tok) return false;

	localStorage.setItem(
		"sessiontoken",
		JSON.stringify({
			token: tok,
			addTime: Date.now(),
		}),
	);
}

export const removeToken = () => localStorage.removeItem("sessiontoken");
