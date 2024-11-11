// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { IAccountData } from '~src/types';
import { poppins } from 'pages/_app';
import AddressComponent from './utils/AddressComponent';

interface Props {
	accountData: IAccountData;
}

const Signatories: React.FC<Props> = ({ accountData }) => {
	if (!accountData?.multisig?.multi_account_member?.length) return null;

	return (
		<div
			className={`${poppins.className} ${poppins.variable} mt-5 w-full rounded-[14px] border border-solid border-[#F6F8FA] bg-[#F6F8FA] p-2 dark:border-separatorDark dark:bg-section-dark-background lg:p-4`}
		>
			<h3 className='text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>Signatories</h3>
			{accountData?.multisig?.multi_account_member.map((signatories, index) => (
				<div key={index}>
					<AddressComponent
						address={signatories?.address}
						isMultisigAddress={true}
					/>
				</div>
			))}
		</div>
	);
};

export default Signatories;
