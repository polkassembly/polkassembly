// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import Image from 'next/image';

import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { ProfileDetailsResponse } from '~src/auth/types';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import AddressConnectModal from '~src/ui-components/AddressConnectModal';
import { Checkbox } from 'antd';
import Address from '~src/ui-components/Address';
import styled from 'styled-components';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { useUserDetailsSelector } from '~src/redux/selectors';

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
	const { addresses } = userProfile;
	const [openAddressLinkModal, setOpenAddressLinkModal] = useState<boolean>(false);
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
					<CustomButton
						className='delegation-buttons border-none'
						variant='default'
						buttonsize='xs'
						onClick={() => setOpenAddressLinkModal(true)}
					>
						<PlusOutlined />

						<span>Link Addresses</span>
					</CustomButton>
				)}
			</div>
			<Checkbox.Group
				className='flex flex-col gap-2'
				onChange={(list) => {
					console.log(list, 'lis');
					setSelectedAddresses(list as any);
				}}
				value={selectedAddresses as CheckboxValueType[]}
			>
				{addresses.map((address) => (
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
		</div>
	);
};
export default styled(ProfileLinkedAddresses)`
	.ant-checkbox-wrapper + .ant-checkbox-wrapper {
		margin-inline-start: 0px !important;
	}
`;
