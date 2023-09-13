// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

export const checkIsProposer = async (address: string, currentUserAddresses:Array<string>) => {
	const { data: addressDetail } = await nextApiClientFetch<any>( 'api/v1/getOnChainAddressData', { address });
	const signatories = addressDetail?.account?.multisig?.multi_account_member;
	if(signatories){
		const allSignatories = signatories.map((user:{address:string}) => getSubstrateAddress(user.address));
		for(const userAddress of currentUserAddresses){
			const address = getSubstrateAddress(userAddress) || userAddress;
			if(allSignatories.includes(address)){
				return true;
			}
		}
		return false;
	}
	return false;
};