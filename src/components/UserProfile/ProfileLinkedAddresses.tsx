// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import Image from 'next/image';
import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { ProfileDetailsResponse } from '~src/auth/types';
import AddressConnectModal from '~src/ui-components/AddressConnectModal';
import { Checkbox, Popover } from 'antd';
import Address from '~src/ui-components/Address';
import styled from 'styled-components';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { DownArrowIcon } from '~src/ui-components/CustomIcons';
import Proxy from '../Settings/Account/Proxy';
import MultiSignatureAddress from '../Settings/Account/MultiSignatureAddress';
import getEncodedAddress from '~src/util/getEncodedAddress';

interface Props {
	className?: string;
	theme?: string;
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
	selectedAddresses: string[];
	setSelectedAddresses: (pre: string[]) => void;
}

const ProfileLinkedAddresses = ({ className, userProfile, selectedAddresses, setSelectedAddresses }: Props) => {
	const { id } = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const { addresses } = userProfile;
	const [openAddressLinkModal, setOpenAddressLinkModal] = useState<boolean>(false);
	const [openLinkExpand, setOpenLinkExpand] = useState<boolean>(false);
	const [openProxyLinkModal, setOpenProxyLinkModal] = useState<boolean>(false);
	const [openLinkMultisig, setOpenLinkMultisig] = useState<boolean>(false);

	const govTypeContent = (
		<div className='flex w-[160px] flex-col gap-2'>
			<span
				className='cursor-pointer dark:text-blue-dark-high'
				onClick={() => setOpenAddressLinkModal(true)}
			>
				Link Address
			</span>
			<span
				className='cursor-pointer dark:text-blue-dark-high'
				onClick={() => setOpenProxyLinkModal(true)}
			>
				Link Proxy Address
			</span>
			<span
				className='cursor-pointer dark:text-blue-dark-high'
				onClick={() => setOpenLinkMultisig(true)}
			>
				Link Multisig Address
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

	return (
		<div
			className={classNames(
				className,
				'flex flex-col gap-5 rounded-[14px] border-[1px] border-solid border-[#D2D8E0] bg-white px-4 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'
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
					Linked Addresses
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
								<span>Link Address</span>
							</span>
							<span className='flex items-center'>
								<DownArrowIcon className={`cursor-pointer text-2xl ${openLinkExpand && 'pink-color rotate-180'}`} />
							</span>
						</div>
					</Popover>
				)}
			</div>
			<Checkbox.Group
				className='flex flex-col gap-2'
				onChange={(list) => {
					setSelectedAddresses(list as any);
				}}
				value={selectedAddresses.map((address) => getEncodedAddress(address, network)) as CheckboxValueType[]}
			>
				{!!addresses?.length &&
					filterDuplicateAddresses(addresses, network).map((address) => (
						<div
							key={address}
							className='flex items-start justify-start rounded-xl border-[1px] border-solid border-[#D2D8E0] px-4 py-3 text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high max-md:flex-col'
						>
							<Checkbox
								value={address}
								className='flex items-center'
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
						</div>
					))}
			</Checkbox.Group>
			<AddressConnectModal
				linkAddressNeeded
				open={openAddressLinkModal}
				setOpen={setOpenAddressLinkModal}
				closable
				onConfirm={() => setOpenAddressLinkModal(false)}
			/>
			<Proxy
				open={openProxyLinkModal}
				dismissModal={() => setOpenProxyLinkModal(false)}
			/>
			<MultiSignatureAddress
				open={openLinkMultisig}
				dismissModal={() => setOpenLinkMultisig(false)}
			/>
		</div>
	);
};
export default styled(ProfileLinkedAddresses)`
	.ant-checkbox-wrapper + .ant-checkbox-wrapper {
		margin-inline-start: 0px !important;
	}
`;
