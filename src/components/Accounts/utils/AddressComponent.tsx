// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Address from '~src/ui-components/Address';
import BalanceDetails from './BalanceDetails';
import SendFundsComponent from './SendFundsComponent';
import AddressActionDropdown from './AddressActionDropdown';
import ProxyTypeBadges from './ProxyTypeBadges';
import { CopyIcon, SubscanIcon } from '~src/ui-components/CustomIcons';
import copyToClipboard from '~src/util/copyToClipboard';
import { message } from 'antd';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';

interface Props {
	proxyAddress: string;
	proxyType?: string;
	isPureProxy?: boolean;
	isMultisigAddress?: boolean;
}

const AddressComponent = ({ proxyAddress, proxyType, isPureProxy = false, isMultisigAddress = false }: Props) => {
	const { network } = useNetworkSelector();
	const { loginAddress } = useUserDetailsSelector();
	const [messageApi] = message.useMessage();
	const success = () => {
		messageApi.open({
			content: 'Address copied to clipboard',
			duration: 10,
			type: 'success'
		});
	};
	const copyLink = (address: string) => {
		copyToClipboard(address);
	};

	return (
		<div className=' mt-6 w-full rounded-[14px] border border-solid border-[#D2D8E0] bg-white p-4 dark:border-separatorDark dark:bg-section-dark-overlay'>
			<div className=' flex items-center justify-between'>
				<div>
					<div className='flex items-center gap-2'>
						<Address
							address={proxyAddress}
							displayInline
							iconSize={30}
							isTruncateUsername={false}
							destroyTooltipOnHide
						/>
						<span
							className='flex cursor-pointer items-center text-base'
							onClick={() => {
								copyLink(proxyAddress || '');
								success();
							}}
						>
							<CopyIcon className='-ml-2 text-xl text-lightBlue dark:text-icon-dark-inactive' />
						</span>
						<span
							className='cursor-pointer'
							onClick={() => window.open(`https://${network}.subscan.io/address/${proxyAddress}`, '_blank')}
						>
							<SubscanIcon className='-ml-1 scale-[65%] text-2xl text-lightBlue dark:text-icon-dark-inactive' />
						</span>
						{isPureProxy && <ProxyTypeBadges text={'PURE PROXY'} />}
						{proxyType && proxyType !== 'Any' && <ProxyTypeBadges text={isPureProxy ? 'PURE PROXY' : proxyType} />}
					</div>
					<BalanceDetails />
				</div>
				<div className='flex items-center gap-2'>
					{loginAddress != proxyAddress && <SendFundsComponent proxyAddress={proxyAddress} />}
					<AddressActionDropdown />
				</div>
			</div>
		</div>
	);
};

export default AddressComponent;
