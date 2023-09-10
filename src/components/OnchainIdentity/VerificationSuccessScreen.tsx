// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { poppins } from 'pages/_app';
import { Button, Modal } from 'antd';
import CloseIcon from '~assets/icons/close-icon.svg';
import SuccessIcon from '~assets/icons/success-verification.svg';
import { useRouter } from 'next/router';
interface Props{
  className?: string;
  socialHandle?: string;
  social: string;
  open: boolean;
	onClose:(pre:boolean)=> void;
}

const VerificationSuccessScreen = ({ className, open, social, socialHandle, onClose  }: Props) => {
	const router = useRouter();

	return <Modal
		zIndex={100000}
		open={open}
		className={`${poppins.variable} ${poppins.className} w-[600px] max-sm:w-full h-[300px]`}
		wrapClassName={className}
		closeIcon={<CloseIcon/>}
		onCancel={() => { onClose(false);}}
		footer={false}
		closable={false}
	>
		<div className='flex justify-center items-center flex-col -mt-[115px]'>
			<SuccessIcon/>
			<label className='text-xl font-semibold text-bodyBlue tracking-[0.15%] -mt-2'>{social} verified successfully</label>
			{socialHandle && <div className='text-2xl text-pink_primary font-semibold mt-4'>{socialHandle}</div>}
			<Button className='mt-6 bg-pink_primary border-none text-white rounded-[4px] h-[40px] text-sm'
				onClick={() => router.push(`/?identityVerification=${true}`)}
			>
				Continue verification
			</Button>
			<div className='mt-12 h-[18px] bg-[#51D36E] w-[600px] -mb-5 -ml-12 -mr-12 max-sm:w-full rounded-b-lg ' />
		</div>
	</Modal>;
};

export default VerificationSuccessScreen;