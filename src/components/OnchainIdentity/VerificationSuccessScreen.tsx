// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { poppins } from 'pages/_app';
import { Modal } from 'antd';

import CloseIcon from '~assets/icons/close-icon.svg';
import SuccessIcon from '~assets/icons/success-verification.svg';

interface Props{
  className?: string;
  socialHandle: string;
  social: string;
  open: boolean;
}

const VerificationSuccessScreen = ({ className, open, social, socialHandle  }: Props) => {

	return <Modal
		zIndex={100000}
		open={open}
		className={`${poppins.variable} ${poppins.className} w-[600px] max-sm:w-full h-[300px]`}
		wrapClassName={className}
		closeIcon={<CloseIcon/>}
		// onCancel={() => {close(true); changeStep(4); openPreModal(false);}}
		footer={false}
		maskClosable={false}
	>
		<div className='flex justify-center items-center flex-col -mt-[115px]'>
			<SuccessIcon/>
			<label className='text-xl font-semibold text-bodyBlue tracking-[0.15%] -mt-2'>{social} verified successfully</label>
			<div className='text-2xl text-pink_primary font-semibold mt-4'>{socialHandle}</div>
			<div className='mt-16 h-[18px] bg-[#51D36E] w-[600px] -mb-5 -ml-12 -mr-12 max-sm:w-full rounded-b-lg ' />
		</div>
	</Modal>;
};

export default VerificationSuccessScreen;