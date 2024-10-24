// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal } from 'antd';
import React, { useState } from 'react';
import { poppins } from 'pages/_app';
import SignupPopup from './SignupPopup';
import LoginPopup from './loginPopup';
import Image from 'next/image';
import styled from 'styled-components';
import { CloseIcon } from './CustomIcons';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useTranslation } from 'react-i18next';

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
	const { t } = useTranslation('common');

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
						<CustomButton
							text={t('login')}
							onClick={() => handleClick('login')}
							variant='primary'
							className='ml-2 w-[360px] p-5'
							height={40}
						/>
						<CustomButton
							text={t('signup')}
							onClick={() => handleClick('signup')}
							variant='default'
							className='w-[360px] p-5'
							height={40}
						/>
					</div>
				}
			>
				<div className='flex flex-col items-center p-1'>
					<Image
						width={221}
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
