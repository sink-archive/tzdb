import { pack, unpack } from "msgpackr";
import type { Account, AccountNoId } from "./types";

function tryParseBigInt(val: any) {
	try {
		return BigInt(val);
	} catch {}
}

export async function saveAccount(
	id: string,
	account: AccountNoId,
	create = false,
) {
	if (create === !!(await KV_ACCOUNTS.get(id, "arrayBuffer")))
		throw new Error(
			create
				? "tried to create existing account"
				: "tried to modify nonexistent amount",
		);

	const correctedAccount: Account = { ...account, id };

	await KV_ACCOUNTS.put(id, pack(correctedAccount));

	return correctedAccount;
}

export const getAccount = async (id: string): Promise<Account | undefined> => {
	const acct = await KV_ACCOUNTS.get(id, "arrayBuffer");
	return acct ? unpack(new Uint8Array(acct)) : undefined;
};

export async function createAccount(account: AccountNoId) {
	const currentId = tryParseBigInt(await KV_MISC.get("last_acct_id")) ?? -1n;

	const nextId = currentId + 1n;

	const savedAcc = await saveAccount(nextId.toString(), account, true);
	await KV_MISC.put("last_acct_id", nextId.toString());

	return savedAcc;
}
