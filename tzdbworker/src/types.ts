//import type { KVNamespace } from "@cloudflare/workers-types";
import type { Timezone } from "./timezones";

// epic util type, thanks Alyxia
type PartiallyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

declare global {
	// misc stuff, currently just user count
	const KV_MISC: KVNamespace;
	// maps account ids -> Account in messagepack
	const KV_ACCOUNTS: KVNamespace;
	// maps discord IDs -> account ids
	const KV_DISCORD: KVNamespace;
	// maps session tokens -> account ids
	const KV_SESSIONS: KVNamespace;
}

export interface Account {
	id: string;
	origin: Timezone;
	offset: number;

	discord?: string;
}

export interface TimezoneResponse {
	origin: Timezone;
	offset: number;
	utcOffset: number;
}

export type AccountNoId = PartiallyOptional<Account, "id">;
