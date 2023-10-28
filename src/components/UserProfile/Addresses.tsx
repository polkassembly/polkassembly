// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CloseOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import React, { FC, useState } from 'react';
import Address from '~src/ui-components/Address';
import { WalletIcon } from '~src/ui-components/CustomIcons';

interface IAddressesProps {
	addresses: string[];
}

const Addresses: FC<IAddressesProps> = (props) => {
	const { addresses } = props;
	const [open, setOpen] = useState(false);
	const toggleOpen = () => setOpen((prev) => !prev);
	if (addresses.length === 0) return null;
	console.log(addresses);
	return (
		<>
			<div>
				<div className='flex items-center gap-x-[6.5px] text-sm font-semibold text-white'>
					<WalletIcon className='text-base text-[#FFBF60]' />
					<span>View addresses</span>
					{addresses.length > 5 ? (
						<button
							onClick={toggleOpen}
							className='ml-auto flex cursor-pointer items-center justify-center border-none bg-transparent text-xs font-medium text-[#FFbF60] underline underline-offset-1 outline-none'
						>
							View All
						</button>
					) : null}
				</div>
				<div className='mt-[17px] flex flex-col gap-y-4'>
					{addresses &&
						Array.isArray(addresses) &&
						addresses.slice(0, 5).map((address) => {
							return (
								<Address
									disableAddressClick={true}
									addressClassName='text-white'
									disableHeader={true}
									iconSize={20}
									ethIdenticonSize={28}
									addressMaxLength={10}
									key={address}
									address={address}
								/>
							);
						})}
				</div>
				<Modal
					title={<h3 className='text-xl font-semibold text-[#1D2632]'>Addresses</h3>}
					closeIcon={<CloseOutlined className='text-sm text-bodyBlue' />}
					onCancel={toggleOpen}
					open={open}
					footer={[]}
				>
					<div>
						<p className='mt-4'>Accounts</p>
						<div className='flex flex-col gap-y-5 px-3'>
							{addresses &&
								Array.isArray(addresses) &&
								addresses.slice(0, 5).map((address) => {
									return (
										<Address
											iconSize={28}
											ethIdenticonSize={34}
											key={address}
											showFullAddress
											address={address}
										/>
									);
								})}
						</div>
					</div>
				</Modal>
			</div>
		</>
	);
};

export default Addresses;
