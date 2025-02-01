// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Image from 'next/image';
import SendFundsModal from './SendFundsModal';
import { IAccountData } from '~src/types';

const SendFundsButton = ({ address, accountData }: { address: string; accountData?: IAccountData }) => {
	const [open, setOpen] = useState<boolean>(false);
	return (
		<>
			<CustomButton
				variant='primary'
				className={'px-2 text-sm font-normal '}
				height={34}
				width={126}
				buttonsize={'14'}
				onClick={() => setOpen(true)}
			>
				<div className='flex items-center gap-[6px]'>
					<Image
						className='h-4 w-4 rounded-full object-contain'
						src={'/assets/icons/send-funds.svg'}
						alt='funds'
						width={20}
						height={20}
					/>
					<span className={'text-sm font-medium tracking-wide'}>Send Funds</span>
				</div>
			</CustomButton>
			<SendFundsModal
				open={open}
				setOpen={setOpen}
				address={address}
				accountData={accountData}
			/>
		</>
	);
};

export default SendFundsButton;
