// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import BalanceDetails from './utils/BalanceDetails';
import SendFundsComponent from './utils/SendFundsComponent';
import AddressActionDropdown from './utils/AddressActionDropdown';
import Address from '~src/ui-components/Address';
import { IAccountData } from '~src/types';
import { poppins } from 'pages/_app';

interface Props {
	accountData: IAccountData;
	loginAddress: string;
}

const AccountInfo: React.FC<Props> = ({ accountData, loginAddress }) => {
	return (
		<div className={`${poppins.className} ${poppins.variable} `}>
			<div className='relative flex w-full items-start justify-between '>
				<div>
					{accountData?.address && (
						<div>
							<Address
								address={accountData?.address}
								displayInline
								iconSize={90}
								isUsedInAccountsPage={true}
								isTruncateUsername={false}
							/>
						</div>
					)}
				</div>
				<div className='flex items-center gap-2'>
					{accountData?.address && loginAddress !== accountData?.address && <SendFundsComponent address={accountData?.address} />}
					{accountData?.address && <AddressActionDropdown address={loginAddress || accountData.address} />}
				</div>
				<span className='absolute left-[104px] top-10'>
					<BalanceDetails address={accountData?.address ? accountData.address : loginAddress} />
				</span>
			</div>
		</div>
	);
};

export default AccountInfo;
