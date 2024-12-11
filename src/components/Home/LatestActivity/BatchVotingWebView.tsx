// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useUserDetailsSelector } from '~src/redux/selectors';
import ImageIcon from '~src/ui-components/ImageIcon';
import LoginPopup from '~src/ui-components/loginPopup';
import SignupPopup from '~src/ui-components/SignupPopup';

const BatchVotingWebView = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const { id } = useUserDetailsSelector();
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);
	return (
		<>
			<section className='relative mb-[70px] '>
				<ImageIcon
					src='/assets/icons/tinder-web-banner.svg'
					alt='vote-badge'
					imgWrapperClassName='flex justify-center items-center w-full'
					imgClassName='relative -mt-1 w-full'
				/>

				<Button
					className='absolute right-[132px] top-[48px] flex h-[40px] w-[155px] items-center justify-center rounded-[40px] border-none bg-black text-xl font-semibold font-semibold text-white'
					onClick={() => {
						if (id) {
							router?.push('/batch-voting');
						} else {
							setLoginOpen(true);
						}
					}}
				>
					{t('lets_begin')}
				</Button>
			</section>
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
		</>
	);
};

export default BatchVotingWebView;
