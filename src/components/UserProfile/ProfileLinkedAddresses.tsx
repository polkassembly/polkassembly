// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { ProfileDetailsResponse } from '~src/auth/types';
import AddressConnectModal from '~src/ui-components/AddressConnectModal';
import { Checkbox, Popover } from 'antd';
import Address from '~src/ui-components/Address';
import styled from 'styled-components';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ClearIdentityOutlinedIcon, DownArrowIcon } from '~src/ui-components/CustomIcons';
import Proxy from '../Settings/Account/Proxy';
import MultiSignatureAddress from '../Settings/Account/MultiSignatureAddress';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { useApiContext, usePeopleChainApiContext } from '~src/context';
import { setOpenRemoveIdentityModal, setOpenRemoveIdentitySelectAddressModal } from '~src/redux/removeIdentity';
import { useDispatch } from 'react-redux';
import dynamic from 'next/dynamic';
import { onchainIdentitySupportedNetwork } from '../AppLayout';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';
import { useTranslation } from 'next-i18next';

const OnchainIdentity = dynamic(() => import('~src/components/OnchainIdentity'), {
	ssr: false
});

interface Props {
	className?: string;
	theme?: string;
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
	selectedAddresses: string[];
	setSelectedAddresses: (pre: string[]) => void;
}

const ProfileLinkedAddresses = ({ className, userProfile, selectedAddresses, setSelectedAddresses }: Props) => {
	const dispatch = useDispatch();
	const { t } = useTranslation('common');
	const { id, loginAddress } = useUserDetailsSelector();
	const { api, apiReady } = useApiContext();
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const { network } = useNetworkSelector();
	const { addresses } = userProfile;
	const [openAddressLinkModal, setOpenAddressLinkModal] = useState<boolean>(false);
	const [openLinkExpand, setOpenLinkExpand] = useState<boolean>(false);
	const [openProxyLinkModal, setOpenProxyLinkModal] = useState<boolean>(false);
	const [openLinkMultisig, setOpenLinkMultisig] = useState<boolean>(false);
	const [identityInfo, setIdentityInfo] = useState<{ [key: string]: boolean }>({});
	const [openSetIdentityModal, setOpenSetIdentityModal] = useState(false);
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);

	const govTypeContent = (
		<div className='flex w-[160px] flex-col gap-2'>
			<span
				className='cursor-pointer dark:text-blue-dark-high'
				onClick={() => setOpenAddressLinkModal(true)}
			>
				{t('link_address')}
			</span>
			<span
				className='cursor-pointer dark:text-blue-dark-high'
				onClick={() => setOpenProxyLinkModal(true)}
			>
				{t('link_proxy_address')}
			</span>
		</div>
	);

	const filterDuplicateAddresses = (addresses: string[], network: string) => {
		const obj: any = {};
		for (const address of addresses) {
			const encodedAdd = getEncodedAddress(address, network) || '';
			if (obj[encodedAdd] === undefined) {
				obj[encodedAdd] = 1;
			} else {
				obj[encodedAdd] += 1;
			}
		}
		const dataArr: string[] = [];
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const data = Object.entries(obj).forEach(([key]) => {
			dataArr.push(key);
		});
		return dataArr;
	};

	const handleBeneficiaryIdentityInfo = async () => {
		if (!api || !apiReady) return;

		let promiseArr: any[] = [];
		for (const address of addresses) {
			if (!address) continue;
			promiseArr = [...promiseArr, getIdentityInformation({ address: address, api: peopleChainApi ?? api, network: network })];
		}
		try {
			const resolve = await Promise.all(promiseArr);
			const info: { [key: string]: boolean } = {};
			addresses.map((addr, index) => {
				info[getEncodedAddress(addr, network) || addr] = !!resolve[index]?.display;
			});
			setIdentityInfo(info);
		} catch (err) {
			console.log(err);
		}
	};
	useEffect(() => {
		if (!api || !apiReady) return;
		handleBeneficiaryIdentityInfo();
	}, [addresses, api, apiReady, peopleChainApi, peopleChainApiReady, network]);

	const handleRemoveIdentity = () => {
		if (loginAddress) {
			dispatch(setOpenRemoveIdentityModal(true));
		} else {
			dispatch(setOpenRemoveIdentitySelectAddressModal(true));
		}
	};

	return (
		<div
			className={classNames(
				className,
				'flex w-full flex-col gap-5 rounded-[14px] border-[1px] border-solid border-section-light-container bg-white px-4 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'
			)}
		>
			<div className='flex justify-between'>
				<span className='flex items-center gap-1.5 text-xl font-semibold dark:text-blue-dark-high'>
					<Image
						src='/assets/profile/linked-addresses.svg'
						alt=''
						width={24}
						height={24}
					/>
					{t('linked_addresses')}
				</span>

				{userProfile?.user_id === id && (
					<Popover
						destroyTooltipOnHide
						zIndex={1056}
						content={govTypeContent}
						placement='bottom'
						onOpenChange={() => setOpenLinkExpand(!openLinkExpand)}
					>
						<div className='flex h-9 w-[160px] items-center justify-between rounded-md border-[1px] border-solid border-pink_primary p-2 text-sm font-medium capitalize text-pink_primary dark:text-pink_primary'>
							<span>
								<PlusOutlined className='mr-1' />
								<span>{t('link_address')}</span>
							</span>
							<span className='flex items-center'>
								<DownArrowIcon className={`cursor-pointer text-2xl ${openLinkExpand && 'pink-color rotate-180'}`} />
							</span>
						</div>
					</Popover>
				)}
			</div>
			<Checkbox.Group
				className='flex w-full flex-col gap-2'
				onChange={(list) => {
					setSelectedAddresses(list as any);
				}}
				value={selectedAddresses.map((address) => getEncodedAddress(address, network)) as CheckboxValueType[]}
			>
				{!!addresses?.length &&
					filterDuplicateAddresses(addresses, network).map((address) => (
						<div
							key={address}
							className='flex w-full items-start justify-start rounded-xl border-[1px] border-solid border-section-light-container px-4 py-3 text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high max-md:flex-col'
						>
							<div className='flex w-full justify-between'>
								<Checkbox
									value={address}
									className='flex w-full items-center'
								>
									<Address
										address={address}
										addressWithVerifiedTick
										disableHeader
										addressMaxLength={5}
										iconSize={18}
										addressClassName='text-sm tracking-wide font-semibold dark:text-blue-dark-high'
									/>
								</Checkbox>
								{id === userProfile?.user_id && onchainIdentitySupportedNetwork.includes(network) && (
									<div className='flex flex-shrink-0'>
										{identityInfo[address] ? (
											<div
												onClick={handleRemoveIdentity}
												className='flex cursor-pointer items-center gap-1.5 text-xs text-lightBlue dark:text-blue-dark-high'
											>
												<span className='ml-0.5 text-base text-lightBlue dark:text-blue-dark-medium'>
													<ClearIdentityOutlinedIcon />
												</span>
												<span>{t('remove_identity')}</span>
											</div>
										) : (
											<div
												className='flex cursor-pointer items-center gap-1.5 text-xs text-lightBlue dark:text-blue-dark-high'
												onClick={() => (!loginAddress ? setOpenAddressLinkedModal(true) : setOpenSetIdentityModal(true))}
											>
												<Image
													src={'/assets/icons/shield-identity.svg'}
													alt=''
													width={18}
													height={18}
												/>
												{t('set_identity')}
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					))}
			</Checkbox.Group>
			<AddressConnectModal
				linkAddressNeeded
				open={openAddressLinkModal}
				setOpen={setOpenAddressLinkModal}
				closable
				onConfirm={() => setOpenAddressLinkModal(false)}
				usedInIdentityFlow={false}
			/>
			<Proxy
				open={openProxyLinkModal}
				dismissModal={() => setOpenProxyLinkModal(false)}
			/>
			<MultiSignatureAddress
				open={openLinkMultisig}
				dismissModal={() => setOpenLinkMultisig(false)}
			/>
			<OnchainIdentity
				open={openSetIdentityModal}
				setOpen={setOpenSetIdentityModal}
				openAddressModal={openAddressLinkedModal}
				setOpenAddressModal={setOpenAddressLinkedModal}
			/>
		</div>
	);
};
export default styled(ProfileLinkedAddresses)`
	.ant-checkbox-wrapper + .ant-checkbox-wrapper {
		margin-inline-start: 0px !important;
	}
	.ant-checkbox-wrapper ant-checkbox-wrapper-checked {
		display: flex;
		width: 100%;
	}
`;
