// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';

interface Props {
  api: ApiPromise;
  network: string;
  tx: SubmittableExtrinsic<'promise'>;
  address: string;
  params?: any;
  errorMessageFallback: string;
  onSuccess: () => Promise<void> | void;
  onFailed: (errorMessageFallback: string) => Promise<void> | void;
  onBroadcast?: () => void;
}
const executeTx = async ({
  api,
  network,
  tx,
  address,
  params = {},
  errorMessageFallback,
  onSuccess,
  onFailed,
  onBroadcast,
}: Props) => {
  if (!api || !tx) return;

  tx.signAndSend(address, params, async ({ status, events, txHash }: any) => {
    if (status.isInvalid) {
      console.log('Transaction invalid');
    } else if (status.isReady) {
      console.log('Transaction is ready');
    } else if (status.isBroadcast) {
      console.log('Transaction has been broadcasted');
      onBroadcast && onBroadcast?.();
    } else if (status.isInBlock) {
      console.log('Transaction is in block');
    } else if (status.isFinalized) {
      console.log(
        `Transaction has been included in blockHash ${status.asFinalized.toHex()}`,
      );
      console.log(`tx: https://${network}.subscan.io/extrinsic/${txHash}`);

      for (const { event } of events) {
        if (event.method === 'ExtrinsicSuccess') {
          await onSuccess();
        } else if (event.method === 'ExtrinsicFailed') {
          console.log('Transaction failed');
          const errorModule = (event.data as any)?.dispatchError?.asModule;
          if (!errorModule) {
            const { method, section, docs } =
              api.registry.findMetaError(errorModule);
            errorMessageFallback = `${section}.${method} : ${docs.join(' ')}`;
            console.log(errorMessageFallback);
            await onFailed(errorMessageFallback);
          } else {
            await onFailed(errorMessageFallback);
          }
        }
      }
    }
  }).catch((error: string) => {
    console.log(':( transaction failed');
    console.error('ERROR:', error);
    onFailed(errorMessageFallback);
  });
};
export default executeTx;
