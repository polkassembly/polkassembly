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
	setStatus?: (pre: string) => void;
}
const executeTx = async ({ api, network, tx, address, params = {}, errorMessageFallback, onSuccess, onFailed, onBroadcast, setStatus }: Props) => {
	if (!api || !tx) return;

	tx.signAndSend(address, params, async ({ status, events, txHash }: any) => {
		if (status.isInvalid) {
			console.log('Transaction invalid');
			setStatus?.('Transaction invalid');
		} else if (status.isReady) {
			console.log('Transaction is ready');
			setStatus?.('Transaction is ready');
		} else if (status.isBroadcast) {
			console.log('Transaction has been broadcasted');
			setStatus?.('Transaction has been broadcasted');
			onBroadcast && onBroadcast?.();
		} else if (status.isInBlock) {
			console.log('Transaction is in block');
			setStatus?.('Transaction is in block');
		} else if (status.isFinalized) {
			console.log(`Transaction has been included in blockHash ${status.asFinalized.toHex()}`);
			console.log(`tx: https://${network}.subscan.io/extrinsic/${txHash}`);

			for (const { event } of events) {
				if (event.method === 'ExtrinsicSuccess') {
					setStatus?.('Transaction Success');
					await onSuccess();
				} else if (event.method === 'ExtrinsicFailed') {
					setStatus?.('Transaction failed');
					console.log('Transaction failed');
					setStatus?.('Transaction failed');
					const dispatchError = (event.data as any)?.dispatchError;

					if (dispatchError?.isModule) {
						const errorModule = (event.data as any)?.dispatchError?.asModule;
						const { method, section, docs } = api.registry.findMetaError(errorModule);
						errorMessageFallback = `${section}.${method} : ${docs.join(' ')}`;
						console.log(errorMessageFallback, 'error module');
						await onFailed(errorMessageFallback);
					} else if (dispatchError?.isToken) {
						console.log(`${dispatchError.type}.${dispatchError.asToken.type}`);
						await onFailed(`${dispatchError.type}.${dispatchError.asToken.type}`);
					} else {
						await onFailed(`${dispatchError.type}` || errorMessageFallback);
					}
				}
			}
		}
	}).catch((error: string) => {
		console.log(':( transaction failed');
		setStatus?.(':( transaction failed');
		console.error('ERROR:', error);
		onFailed(errorMessageFallback);
	});
};
export default executeTx;
