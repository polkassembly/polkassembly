// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { IAccountData } from '~src/types';
import AddressComponent from './utils/AddressComponent';

interface Props {
	accountData: IAccountData;
}

const MultisigDetails: React.FC<Props> = ({ accountData }) => {
	if (!accountData?.multisig?.multi_account?.length) return null;

	return (
		<>
			<h3 className='mt-5 text-2xl font-semibold text-blue-light-high dark:text-blue-dark-high'>Multisigs</h3>
			<div>
				{accountData?.multisig?.multi_account.map((multisigAddress, index) => (
					<div key={index}>
						<AddressComponent address={multisigAddress?.address} />
					</div>
				))}
			</div>
		</>
	);
};

export default MultisigDetails;