// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Modal } from 'antd';
import React, { useState } from 'react';
import { poppins } from 'pages/_app';
import SignupPopup from './SignupPopup';
import LoginPopup from './loginPopup';
import Image from 'next/image';
import styled from 'styled-components';
import { CloseIcon } from './CustomIcons';

interface Props {
	image: String;
	title: String;
	subtitle: String;
	modalOpen: boolean;
	setModalOpen: (pre: boolean) => void;
	className?: string;
	theme?: string;
}

const ReferendaLoginPrompts = ({ image, title, subtitle, modalOpen, setModalOpen, className }: Props) => {
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);

	const handleClick = (path: String) => {
		if (path === 'login') {
			setLoginOpen(true);
		} else {
			setSignupOpen(true);
		}
		setModalOpen(false);
	};

	return (
		<div>
			<Modal
				open={modalOpen}
				className={`${poppins.variable} ${poppins.className} text w-[570px] max-w-full shrink-0 max-sm:w-[100%] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				onCancel={() => setModalOpen(false)}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				centered
				zIndex={1002}
				wrapClassName={`${className} dark:bg-modalOverlayDark`}
				footer={
					<div className='center-aligned mt-[32px] flex flex-col items-center justify-center gap-4 pb-8'>
						<Button
							className='flex h-[40px] w-[60%] items-center justify-center rounded border-pink_primary bg-pink_primary p-5 text-sm font-medium leading-5 text-white hover:border-pink_primary hover:bg-pink_secondary'
							onClick={() => handleClick('login')}
						>
							Login
						</Button>
						<Button
							className='-ml-0 flex h-[40px] w-[60%] items-center justify-center rounded border-pink_primary p-5 text-sm font-medium leading-5 text-pink_primary hover:border-pink_primary hover:bg-pink_secondary hover:text-white dark:bg-transparent'
							onClick={() => handleClick('signup')}
						>
							Signup
						</Button>
					</div>
				}
			>
				<div className='flex flex-col items-center p-1'>
					<Image
						width={280}
						height={221}
						src={`${image}`}
						alt=''
					/>
					<h5 className='leading-24 traking-normal mt-8 text-center text-xl font-semibold dark:text-white max-sm:text-base'>{title}</h5>
					<h5 className='leading-21 text-center font-poppins text-sm font-medium tracking-normal dark:text-white max-sm:text-xs'>{subtitle}</h5>
				</div>
			</Modal>
			<SignupPopup
				setLoginOpen={setLoginOpen}
				modalOpen={openSignup}
				setModalOpen={setSignupOpen}
				isModal={true}
			/>
			<LoginPopup
				setSignupOpen={setSignupOpen}
				modalOpen={openLogin}
				setModalOpen={setLoginOpen}
				isModal={true}
			/>
		</div>
	);
};
export default styled(ReferendaLoginPrompts)`
	.text .ant-modal-content {
		color: var(--bodyBlue) !important;
		border-radius: 4px !important;
	}
`;
