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
import Link from 'next/link';

interface Props {
	address: string;
	proxyType?: string;
	isPureProxy?: boolean;
	isMultisigAddress?: boolean;
}

const AddressComponent = ({ address, proxyType, isPureProxy, isMultisigAddress = false }: Props) => {
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
		<div className='mt-5 w-full rounded-[14px] border border-solid border-[#D2D8E0] bg-white p-4 dark:border-separatorDark dark:bg-section-dark-overlay'>
			<div className=' flex items-start justify-between'>
				<div className='relative'>
					<div className='flex items-start gap-2'>
						<Address
							address={address}
							displayInline
							iconSize={80}
							isTruncateUsername={false}
							destroyTooltipOnHide
							isUsedInAccountsPage={true}
						/>
						<div className='mt-[2px] flex gap-1'>
							<span
								className='flex cursor-pointer items-center text-base'
								onClick={() => {
									copyLink(address || '');
									success();
								}}
							>
								<CopyIcon className='-ml-2 text-xl text-lightBlue dark:text-icon-dark-inactive' />
							</span>
							<Link
								href={`https://${network}.subscan.io/address/${address}`}
								passHref
							>
								<a
									target='_blank'
									rel='noopener noreferrer'
								>
									<SubscanIcon className='-ml-1 scale-[65%] text-2xl text-lightBlue dark:text-icon-dark-inactive' />
								</a>
							</Link>
							{isMultisigAddress && <ProxyTypeBadges text={'MULTISIG SIGNATORY'} />}
							{isPureProxy && <ProxyTypeBadges text={'PURE PROXY'} />}
							{proxyType && proxyType !== 'Any' && <ProxyTypeBadges text={isPureProxy ? 'PURE PROXY' : proxyType} />}
						</div>
						<span className='absolute left-[94px] top-9'>
							<BalanceDetails address={address} />
						</span>
					</div>
				</div>
				<div className='flex items-center gap-2'>
					{loginAddress != address && <SendFundsComponent address={address} />}
					<AddressActionDropdown address={address} />
				</div>
			</div>
		</div>
	);
};

export default AddressComponent;
