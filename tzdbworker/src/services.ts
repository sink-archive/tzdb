import { Account, Service } from "./types";

export const services: Record<keyof Account["services"], Service> = {
	discord: {
		kv: KV_DISCORD,
		scopes: ["identify"],
		idUrl: "https://discord.com/api/v10/users/@me",
		selector: (user) => user.id,
	},
};

const getIdFromToken = async (s: Service, tok: string) =>
	s.selector(
		(await (
			await fetch(s.idUrl, {
				headers: {
					Authorization: (s.tokenPrefix ?? "Bearer ") + tok,
					"User-Agent":
						"TZDB-Worker (https://github.com/yellowsink/tzdb, v1.0.0)",
				},
			})
		).json()) as any,
	);
