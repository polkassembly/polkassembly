// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IMultisig, IProxy } from './type';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ApiPromise } from '@polkadot/api';

interface IMultisigAndProxyResponse {
	data: {
		multisig: Array<IMultisig>;
		proxy: Array<IProxy>;
		proxiedBy: Array<IProxy>;
	} | null;
	error: string | null;
	status: number;
}

/**
 * @description This class is used to use all the features related to multisig and proxy
 */
export class MultisigService {
	/**
	 * @description This method is used to fetch multisig and proxy addresses from the users addresses
	 * @param address - The address of the user
	 * @returns The multisig and proxy addresses
	 */
	static async fetchMultisigAndProxyAddresses(address: string) {
		const { data, error } = await nextApiClientFetch<IMultisigAndProxyResponse>('/api/v1/multisig-address', {
			address: address
		});
		if (error || !data?.data) {
			console.error('Error fetching multisig and proxy', error);
			return {
				multisig: [],
				proxiedBy: [],
				proxy: []
			};
		}
		return data.data;
	}

	/**
	 * @description This method is used to generate multisig call
	 * @param api ApiPromise - The api
	 * @param multisigDetails IMultisig - The multisig details
	 * @param submitterAddress string - The submitter address
	 * @param callData SubmittableExtrinsic - The call data
	 */
	static async generateMultisigCall(api: ApiPromise, multisigDetails: IMultisig, userAddress: string, callData: SubmittableExtrinsic<'promise'>) {
		if (!api || !multisigDetails || !userAddress || !callData) {
			console.error('Invalid parameters from MultisigService.generateMultisigCall');
			return;
		}
		const { address = '', threshold = null, signatories = [] } = multisigDetails;

		if (!address || !threshold || !signatories || !signatories.length) {
			console.error('Invalid multisig details from MultisigService.generateMultisigCall');
			return;
		}

		if (!signatories.includes(userAddress)) {
			console.error('User is not a signatory of the multisig from MultisigService.generateMultisigCall');
			return;
		}

		const MAX_WEIGHT = (await callData.paymentInfo(userAddress))?.weight;
		const filteredSignatories = signatories.filter((signatory) => signatory !== userAddress);

		return api.tx.multisig.asMulti(threshold, filteredSignatories, null, callData, MAX_WEIGHT);
	}

	/**
	 * @description This method is used to generate a multisig call with a proxy
	 * @param api ApiPromise - The api
	 * @param multisigDetails IMultisig - The multisig details
	 * @param userAddress string - The user address
	 * @param callData SubmittableExtrinsic<'promise'> - The call data
	 * @param proxyAddress string - The proxy address
	 */
	static async generateMultisigCallWithProxy(api: ApiPromise, multisigDetails: IMultisig, userAddress: string, callData: SubmittableExtrinsic<'promise'>, proxyAddress: string) {
		const multisigCall = await this.generateMultisigCall(api, multisigDetails, userAddress, callData);
		if (!multisigCall) {
			console.error('Failed to generate multisig call from MultisigService.generateMultisigCallWithProxy');
			return;
		}
		return api.tx.proxy.proxy(proxyAddress, null, multisigCall);
	}

	/**
	 * @description This method is used to generate a proxy call
	 * @param api ApiPromise - The api
	 * @param callData SubmittableExtrinsic<'promise'> - The call data
	 * @param proxyAddress string - The proxy address
	 */
	static async generateProxyCall(api: ApiPromise, callData: SubmittableExtrinsic<'promise'>, proxyAddress: string) {
		if (!api || !callData || !proxyAddress) {
			console.error('Invalid parameters from MultisigService.generateProxyCall');
			return;
		}
		return api.tx.proxy.proxy(proxyAddress, null, callData);
	}
}
