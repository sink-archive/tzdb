// talks to the backend

import { getSessionToken, removeToken, updateToken } from "./sessiontoken";

const route = (endpoint: string) =>
	new URL(endpoint, "http://127.0.0.1:1337/").href;

async function fetcher<T = any>(
	endpoint: string,
	method = "get",
	queries?: Record<string, string>,
) {
	const queryString = !queries
		? ""
		: "?" +
		  Object.entries(queries)
				.map((kv) => kv.map(encodeURIComponent).join("="))
				.join("&");

	const resp = await fetch(route(endpoint) + queryString, {
		method,
		headers: {
			Authorization: getSessionToken(),
		},
	}).then((r) => r.json() as Promise<T>);

	updateToken();

	return resp;
}

export const tzlist = () => fetcher("tzlist");
export const self = () => fetcher("self");

export const lookup = (service: string, id: string) =>
	fetcher(`${service}/lookup/${id}`);

export const assoc = (service: string, token: string) =>
	fetcher(`${service}/assoc`, "post", { token });

export const reassoc = (service: string, token: string) =>
	fetcher(`${service}/reassoc`, "post", { token });

export const deassoc = (service: string) =>
	fetcher(`${service}/deassoc`, "delete");

export const createAccount = (
	origin: string,
	offset: number,
	service: string,
	token: string,
) =>
	fetcher("acct/create", "post", {
		origin,
		offset: offset.toString(),
		service,
		token,
	});

export const modifyAccount = (origin: string, offset: number) =>
	fetcher("acct/modify", "post", { origin, offset: offset.toString() });

export const deleteAccount = () => fetcher("acct/delete", "delete");

export const login = async (service: string, token: string) => {
	const sessionToken = await fetcher("auth/login", "post", { service, token });
	if (sessionToken) updateToken(sessionToken);
	return !!sessionToken;
};

export const logout = async () => {
	await fetcher("/auth/logout", "post");
	removeToken();
};
