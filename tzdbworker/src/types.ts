//import type { KVNamespace } from "@cloudflare/workers-types";

// epic util type, thanks Alyxia
type PartiallyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

declare global {
  // misc stuff, currently just user count
  const KV_MISC: KVNamespace;
  // maps account ids -> Account in messagepack
  const KV_ACCOUNTS: KVNamespace;
}

export interface Account {
  id: string;
  origin: string;
  offset: number;
}

export type AccountNoId = PartiallyOptional<Account, "id">;
