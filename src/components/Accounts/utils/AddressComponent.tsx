// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
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
	const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' && window.innerWidth < 768);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<div className='mt-3 md:mt-5 w-full rounded-[14px] border border-solid border-[#D2D8E0] bg-white p-[10px] md:p-4 dark:border-separatorDark dark:bg-section-dark-overlay'>
			<div className=' md:flex items-start justify-between'>
				<div className='relative'>
					<div className=''>
						<div className='flex items-start gap-2'>
						<Address
							address={address}
							displayInline
							iconSize={isMobile ? 24 : 80}
							isTruncateUsername={false}
							destroyTooltipOnHide
							isUsedInAccountsPage={true}
						/>
						<div className='md:mt-[2px] md:flex gap-1'>
							<div className='flex gap-1'>
							<div
								className='flex cursor-pointer items-center text-base'
								onClick={() => {
									copyLink(address || '');
									success();
								}}
							>
								<CopyIcon className='-ml-2 md:mt-0 text-xl text-lightBlue dark:text-icon-dark-inactive' />
							</div>
							<Link
								href={`https://${network}.subscan.io/address/${address}`}
								passHref
							>
								<SubscanIcon className='-ml-1 scale-[65%] text-2xl text-lightBlue dark:text-icon-dark-inactive' />
							</Link>
							</div>
							<div className='hidden md:flex gap-2'>
							{isMultisigAddress && <ProxyTypeBadges text={'MULTISIG SIGNATORY'} />}
							{isPureProxy && <ProxyTypeBadges text={'PURE PROXY'} />}
							{proxyType && proxyType !== 'Any' && !isPureProxy && <ProxyTypeBadges text={proxyType} />}
							</div>
						</div>
						</div>
						<span className='md:absolute md:left-[94px] md:top-9 '>
							<BalanceDetails address={address} />
						</span>
						<div className='flex md:hidden mt-[6px] gap-2'>
							{isMultisigAddress && <ProxyTypeBadges text={'MULTISIG SIGNATORY'} />}
							{isPureProxy && <ProxyTypeBadges text={'PURE PROXY'} />}
							{proxyType && proxyType !== 'Any' && !isPureProxy && <ProxyTypeBadges text={proxyType} />}
							</div>
					</div>
				</div>
				<div className='flex items-center gap-2 mt-2 md:mt-0'>
					{loginAddress != address && <SendFundsComponent address={address} />}
					<AddressActionDropdown address={address} />
				</div>
			</div>
		</div>
	);
};

export default AddressComponent;
