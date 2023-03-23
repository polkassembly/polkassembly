// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button ,Modal } from 'antd';
import React, { useState } from 'react';
import CloseIcon from 'public/assets/icons/close.svg';
import { poppins } from 'pages/_app';
import SignupPopup from './SignupPopup';
import LoginPopup from './loginPopup';
import Image from 'next/image';
import styled from 'styled-components';

interface Props {
    image:String;
    title:String;
    subtitle:String;
    modalOpen:boolean;
    setModalOpen:( pre:boolean)=>void;
    className?:string;
}

const ReferendaLoginPrompts=({ image,title,subtitle,modalOpen,setModalOpen,className }:Props ) => {
	const [openLogin,setLoginOpen]=useState<boolean>(false);
	const [openSignup,setSignupOpen]=useState<boolean>(false);
	const handleClick=(path:String) => {
		if(path==='login'){
			setLoginOpen(true);
		} else{
			setSignupOpen(true);
		}
		setModalOpen(false);
	};

	return <div>
		<Modal
			open={modalOpen}
			className={`${poppins.variable} ${poppins.className} max-w-full shrink-0 w-[570px] max-sm:w-[100%] text`}
			onCancel={() => setModalOpen(false)}
			closeIcon={<CloseIcon/>}centered
			zIndex={1002}
			wrapClassName={className}
			footer={[
				<div key="1" className="justify-center center-aligned flex flex-col items-center gap-4 pb-8  mt-[32px]">
					<Button
						className='bg-pink_primary hover:bg-pink_secondary text-white h-[40px] border-pink_primary hover:border-pink_primary flex items-center justify-center p-5 w-[60%] text-[14px] font-medium rounded leading-5'
						onClick={() => handleClick('login')} >Login</Button>
					<Button
						className='hover:bg-pink_secondary text-pink_primary h-[40px] border-pink_primary hover:border-pink_primary hover:text-white rounded flex items-center justify-center p-5 w-[60%] -ml-0 text-[14px] leading-5 font-medium'
						onClick={() => handleClick('signup')}>Signup</Button>
				</div>]}>
			<div className="flex flex-col items-center p-1"><Image width={280} height={221}  src={`${image}`} alt=""/>
				<h5 className="text-[20px] leading-24 traking-normal mt-[32px] font-semibold max-sm:text-[16px]">{title}</h5>
				<h5 className="text-[14px] tracking-normal font-medium leading-21 font-poppins max-sm:text-[12px]">{subtitle}</h5></div>
		</Modal>
		{ openSignup && <SignupPopup setLoginOpen={setLoginOpen} modalOpen={openSignup} setModalOpen={setSignupOpen} isModal={true} />}
		{ openLogin &&<LoginPopup setSignupOpen={setSignupOpen} modalOpen={openLogin} setModalOpen={setLoginOpen} isModal={true} />}
	</div>;
};
export default styled(ReferendaLoginPrompts)`
.text .ant-modal-content{
  color: #243A57  !important;
  border-radius:4px !important;
}
`;