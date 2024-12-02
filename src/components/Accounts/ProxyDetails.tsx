// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { IAccountData } from '~src/types';
import { dmSans } from 'pages/_app';
import AddressComponent from './utils/AddressComponent';

interface Props {
	accountData: IAccountData;
	linkedAddresses?: Array<{ linked_address: string; type: string }>;
}

const ProxyDetails: React.FC<Props> = ({ accountData, linkedAddresses }) => {
	if (!accountData?.proxy) return null;

	return (
		<>
			{accountData?.proxy?.real_account?.length > 0 && (
				<div
					className={`${dmSans.className} ${dmSans.variable} mt-5 w-full rounded-[14px] border border-solid border-[#F6F8FA] bg-[#F6F8FA] p-[10px] dark:border-separatorDark dark:bg-section-dark-background lg:p-4`}
				>
					<h3 className='text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>Proxy</h3>
					<div className='flex w-full flex-col '>
						<div>
							{linkedAddresses &&
								accountData?.proxy?.real_account.map((realAccount, index) => (
									<div key={index}>
										<AddressComponent
											address={realAccount?.account_display?.address}
											proxyType={realAccount?.proxy_type}
											isPureProxy={true}
											linkedAddresses={linkedAddresses}
										/>
									</div>
								))}
						</div>

						{linkedAddresses && accountData?.proxy?.proxy_account?.length > 0 && (
							<div>
								{accountData.proxy.proxy_account.map((proxyAccount, index) => (
									<div key={index}>
										<AddressComponent
											address={proxyAccount?.account_display?.address}
											proxyType={proxyAccount?.proxy_type}
											linkedAddresses={linkedAddresses}
										/>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default ProxyDetails;
