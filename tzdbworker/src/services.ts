import { Account, Service } from "./types";

const fetcher = <Tk extends string = string, Tv = string>(
	url: string,
	headers: Record<string, string> = {},
	method = "get",
	body?: Record<string, string>,
) =>
	fetch(url, {
		method,
		headers: {
			...headers,
			"User-Agent": "TZDB-Worker (https://github.com/yellowsink/tzdb, v1.0.0)",
		},
		body: !body
			? undefined
			: Object.entries(body)
					.map((kvPair) => kvPair.map(encodeURIComponent).join("="))
					.join("&"),
	}).then((r) => r.json() as Promise<Record<Tk, Tv>>);

export const services: Record<keyof Account["services"], Service> = {
	discord: {
		kv: KV_DISCORD,
		async idFromCode(code) {
			const tokenResp = await fetcher<"access_token">(
				"https://discord.com/api/oauth2/token",
				{
					"Content-Type": "application/x-www-form-urlencoded",
				},
				"post",
				{
					code,
					client_id: "1069981963139694736",
					client_secret: ENV_DISCORD_CLIENT_SECRET,
					grant_type: "authorization_code",
					redirect_uri: "http://127.0.0.1:1337/oauthredir",
				},
			);

			if (!tokenResp?.access_token) return;

			const userResp = await fetcher<"id">(
				"https://discord.com/api/v10/users/@me",
				{
					Authorization: `Bearer ${tokenResp.access_token}`,
				},
			);

			return userResp?.id;
		},
	},
};

export const idFromCode = (service: keyof Account["services"], tok: string) =>
	services[service]!.idFromCode(tok);

export const isSupportedService = (
	service: string,
): service is keyof Account["services"] => service in services;
