import type { KeyringPair } from '@polkadot/keyring/types'

import { ApiPromise } from '@polkadot/api'

import '@kiltprotocol/augment-api'

export async function getKiltDidName(
  api: ApiPromise,
  lookupAccountAddress: KeyringPair['address']
): Promise<string | null> {
  const didDetails = await api.call.did.queryByAccount({
    AccountId32: lookupAccountAddress
  }) as any
  if (didDetails.isNone) {
    return null
  }

  const { w3n } = didDetails.unwrap()

  if (w3n.isNone) {
    return null
  }

  return w3n.unwrap().toHuman()
}