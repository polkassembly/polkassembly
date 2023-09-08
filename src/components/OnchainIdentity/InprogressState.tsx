// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useContext, useEffect } from 'react';
import { ISocials } from '.';
import { poppins } from 'pages/_app';
import { Button, Modal } from 'antd';
import CloseIcon from '~assets/icons/close-icon.svg';
import SuccessIcon from '~assets/icons/identity-success.svg';
import { NetworkContext } from '~src/context/NetworkContext';
import { chainProperties } from '~src/global/networkConstants';
import { formatBalance } from '@polkadot/util';
import { ESocials } from './SocialVerification';

interface Props{
 className?: string;
 socials: ISocials;
 open?: boolean;
 changeStep: (step: number) => void;
 close: (pre: boolean) => void;
 openPreModal: (pre: boolean) => void;
 handleVerify: (pre: ESocials) => Promise<void>;
}

const InprogressState = ({ className, open, close, changeStep , openPreModal, socials, handleVerify }: Props) => {
	const { email } = socials;

	const { network } = useContext(NetworkContext);

	useEffect(() => {
		if(!network) return ;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[network]);

	const handleVerified = async() => {
		await handleVerify(ESocials.EMAIL);
	};

	return <Modal
	centered
		open={open}
		className={`${poppins.variable} ${poppins.className} w-[650px] max-sm:w-full`}
		wrapClassName={className}
		closeIcon={<CloseIcon/>}
		onCancel={() => {
			close(true);
			changeStep(3);
			openPreModal(false);
		}
	}
		footer={false}
		maskClosable={false}
	><>
			<div className='flex justify-center items-center flex-col -mt-[132px]'>
				<SuccessIcon/>
				<label className='text-xl font-semibold text-bodyBlue tracking-[0.0015em] mt-4'>Email verification in progress</label>
				<div className='text-2xl text-pink_primary font-semibold mt-4'>Check your email!</div>
				<div className=' mt-4 w-full text-sm shrink-0 text-center tracking-wide flex flex-col items-center justify-center '>
				<span className='flex shrink-0'>A verification link has been sent to your mail address</span>
				<u className='text-pink_primary font-medium'><a target='_blank' href='https://mail.google.com/' rel="noreferrer">{email?.value}</a></u>
				</div>
			</div>

			<Button
			onClick={() => {
				close(true);
				handleVerified();
				changeStep(3);
				openPreModal(true);
			}}
			className='bg-pink_primary text-sm mt-4 w-full rounded-[4px] border-none h-[40px] text-white tracking-wide'
			>
        Verified successfully
				</Button>
		</>
	</Modal>;
};

export default InprogressState;