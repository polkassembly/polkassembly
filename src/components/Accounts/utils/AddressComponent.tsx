// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import Address from '~src/ui-components/Address';
import BalanceDetails from './BalanceDetails';
import AddressActionDropdown from './AddressActionDropdown';
import ProxyTypeBadges from './ProxyTypeBadges';
import { CopyIcon, SubscanIcon } from '~src/ui-components/CustomIcons';
import copyToClipboard from '~src/util/copyToClipboard';
import { message } from 'antd';
import { useNetworkSelector } from '~src/redux/selectors';
import Link from 'next/link';
import { IAccountData, LinkProxyType } from '~src/types';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import Alert from '~src/basic-components/Alert';
import { useApiContext } from '~src/context';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import SendFundsButton from '../SendFundsButton';

interface Props {
	address: string;
	proxyType?: string;
	isPureProxy?: boolean;
	isMultisigAddress?: boolean;
	linkedAddresses: Array<{ linked_address: string; is_linked: boolean }>;
	accountData?: IAccountData;
}

const AddressComponent = ({ address, proxyType, isPureProxy, isMultisigAddress = false, linkedAddresses, accountData }: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const [messageApi, contextHolder] = message.useMessage();
	const [existentialDeposit, setExistentialDeposit] = useState<string | null>(null);
	const substrateAddr = getSubstrateAddress(address);
	const unit = `${chainProperties[network]?.tokenSymbol}`;

	const success = () => {
		messageApi.open({
			content: 'Address copied to clipboard',
			duration: 10,
			type: 'success'
		});
	};
	const copyLink = (address: string) => {
		copyToClipboard(address);
		success();
	};
	const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' && window.innerWidth < 768);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const fetchExistentialDeposit = async () => {
		if (!api && !apiReady) return;
		try {
			const deposit = await api?.consts?.balances?.existentialDeposit?.toString();
			deposit && setExistentialDeposit(deposit);
		} catch (error) {
			console.error('Error fetching existential deposit:', error);
			setExistentialDeposit(null);
		}
	};

	useEffect(() => {
		if (!api && !apiReady) return;
		fetchExistentialDeposit();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	const getType = (): LinkProxyType | null => {
		if (isMultisigAddress) return LinkProxyType.MULTISIG;
		if (isPureProxy) return LinkProxyType.PUREPROXY;
		if (proxyType) return LinkProxyType.PROXY;
		return null;
	};

	const type = getType();

	return (
		<>
			{contextHolder}
			<div className='mt-3 w-full rounded-[14px] border border-solid border-[#D2D8E0] bg-white p-[10px] dark:border-separatorDark dark:bg-section-dark-overlay md:mb-5 md:mt-2 md:p-4'>
				<div className=' items-start justify-between md:flex'>
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
									isProfileView
								/>
								<div className='gap-1 md:mt-[2px] md:flex'>
									<div className='flex gap-1'>
										<div
											className='flex cursor-pointer items-center text-base'
											onClick={() => {
												copyLink(substrateAddr ? substrateAddr : address);
											}}
										>
											<CopyIcon className='-ml-1 text-xl text-lightBlue dark:text-icon-dark-inactive md:mt-0' />
										</div>
										<Link
											href={`https://${network}.subscan.io/address/${address}`}
											passHref
											target='_blank'
										>
											<SubscanIcon className='-ml-[6px] scale-[65%] text-2xl text-lightBlue dark:text-icon-dark-inactive' />
										</Link>
									</div>
									<div className='hidden gap-2 md:flex'>
										{isMultisigAddress && <ProxyTypeBadges text={'MULTISIG SIGNATORY'} />}
										{isPureProxy && <ProxyTypeBadges text={'PURE PROXY'} />}
										{proxyType && proxyType !== 'Any' && !isPureProxy && <ProxyTypeBadges text={proxyType} />}
									</div>
								</div>
							</div>
							<span className='md:absolute md:left-[94px] md:top-8 '>
								<BalanceDetails address={address} />
							</span>
							<div className='mt-[6px] flex gap-2 md:hidden'>
								{isMultisigAddress && <ProxyTypeBadges text={'MULTISIG SIGNATORY'} />}
								{isPureProxy && <ProxyTypeBadges text={'PURE PROXY'} />}
								{proxyType && proxyType !== 'Any' && !isPureProxy && <ProxyTypeBadges text={proxyType} />}
							</div>
						</div>
					</div>
					<div className='mt-2 flex items-center gap-2 sm:gap-4 md:mt-0'>
						<SendFundsButton
							address={address}
							accountData={accountData}
						/>
						<AddressActionDropdown
							address={address}
							type={type}
							isUsedInProxy={true}
							linkedAddresses={linkedAddresses}
						/>
					</div>
				</div>
				{isPureProxy && existentialDeposit && (
					<Alert
						message={
							<div className='py-1 text-sm text-blue-light-high dark:text-blue-dark-high'>
								Balance of <span className='text-sm font-medium'>{existentialDeposit ? `>${formatedBalance(existentialDeposit.toString(), unit)} ${unit}` : 'Loading...'}</span>{' '}
								(Existential deposit) is required to maintain account
							</div>
						}
						type='info'
						showIcon
						className='mt-3 py-1'
					/>
				)}
			</div>
		</>
	);
};

export default AddressComponent;
