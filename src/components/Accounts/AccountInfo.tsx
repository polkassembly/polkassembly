// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import BalanceDetails from './utils/BalanceDetails';
import AddressActionDropdown from './utils/AddressActionDropdown';
import Address from '~src/ui-components/Address';
import { IAccountData } from '~src/types';
import { poppins } from 'pages/_app';

interface Props {
	accountData: IAccountData;
	loginAddress: string;
}

const AccountInfo: React.FC<Props> = ({ accountData, loginAddress }) => {
	const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' && window.innerWidth < 768);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<div className={`${poppins.className} ${poppins.variable} `}>
			<div className='relative w-full '>
				<div className='flex items-start justify-between'>
					{accountData?.address && (
						<div>
							<Address
								address={accountData?.address}
								displayInline
								iconSize={isMobile ? 24 : 90}
								isUsedInAccountsPage={true}
								isTruncateUsername={false}
							/>
						</div>
					)}
					<div className='flex items-center gap-2'>{accountData?.address && <AddressActionDropdown address={loginAddress || accountData.address} />}</div>
				</div>
				<span className='md:absolute md:left-[104px] md:top-10'>
					<BalanceDetails address={accountData?.address ? accountData.address : loginAddress} />
				</span>
			</div>
		</div>
	);
};

export default AccountInfo;
