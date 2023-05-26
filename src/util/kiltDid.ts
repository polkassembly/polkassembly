import type { KeyringPair } from '@polkadot/keyring/types'

import { ApiPromise, WsProvider } from '@polkadot/api'

import '@kiltprotocol/augment-api'
import { typesBundle } from '@kiltprotocol/type-definitions'
import { chainProperties, network } from '~src/global/networkConstants'

export async function getKiltDidName(
  lookupAccountAddress: KeyringPair['address']
): Promise<string | null> {
  const api = await ApiPromise.create({
    provider: new WsProvider(chainProperties[network.KILT].rpcEndpoint),
    typesBundle
  })

  const didDetails = await api.call.did.queryByAccount({
    AccountId32: lookupAccountAddress
  })
  if (didDetails.isNone) {
    return null
  }

  const { w3n } = didDetails.unwrap()

  if (w3n.isNone) {
    return null
  }

  return w3n.unwrap().toHuman()
}