import { pack, unpack } from "msgpackr";
import type { AccountNoId } from "./types";

export async function saveAccount(id: string, account: AccountNoId, create = false) {
  if (create === !!(await KV_ACCOUNTS.get(id, "arrayBuffer")))
    throw new Error(
      create
        ? "tried to create existing account"
        : "tried to modify nonexistent amount"
    );

  const correctedAccount = { ...account, id };

  await KV_ACCOUNTS.put(id, pack(correctedAccount));
}

export const getAccount = async (id: string) => {
  const acct = await KV_ACCOUNTS.get(id, "arrayBuffer");
  return acct ? unpack(new Uint8Array(acct)) : undefined;
};

export async function createAccount(account: AccountNoId) {
  const currentId = await KV_MISC.get("last_acct_id");

  const actualCurrentId =
    currentId && Number.isSafeInteger(parseInt(currentId))
      ? parseInt(currentId)
      : -1;

  const nextId = actualCurrentId + 1;

  await saveAccount(nextId.toString(), account, true);
  await KV_MISC.put("last_acct_id", nextId.toString());
}
