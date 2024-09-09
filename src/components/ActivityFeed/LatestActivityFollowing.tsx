// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { useUserDetailsSelector } from '~src/redux/selectors';
import LoginPopup from '~src/ui-components/loginPopup';
import SignupPopup from '~src/ui-components/SignupPopup';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

// Login button component
const LoginButton = ({ onClick }: { onClick: () => void }) => (
	<p
		onClick={onClick}
		className='w-[400px] cursor-pointer rounded-md bg-[#E5007A] px-4 py-2 text-center text-lg text-white'
	>
		Log In
	</p>
);

// Signup button component
const SignupButton = ({ onClick }: { onClick: () => void }) => (
	<p
		onClick={onClick}
		className='w-[400px] cursor-pointer rounded-md border-solid border-[#E5007A] px-4 py-2 text-center text-lg text-[#E5007A]'
	>
		Sign Up
	</p>
);

const LatestActivityFollowing = ({ gov2LatestPosts }: { gov2LatestPosts: any }) => {
	const currentuser = useUserDetailsSelector();
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);
	useEffect(() => {
		const fetchPostUpdates = async () => {
			try {
				const { data, error } = await nextApiClientFetch<any>('/api/v1/auth/actions/getsubscribedpost', undefined, 'GET');

				if (error) {
					console.error('Error fetching post updates:', error);
					return;
				}

				console.log('Subscribed posts:', data.posts);
			} catch (error) {
				console.error('Error fetching post updates:', error);
			}
		};

		fetchPostUpdates();
	}, []);

	console.log('gov2LatestPosts', gov2LatestPosts);
	return (
		<div className=''>
			{currentuser && currentuser?.id && currentuser?.username ? (
				<div className='flex h-[900px] w-[900px] flex-col items-center rounded-xl border border-solid border-[#D2D8E0] bg-white'>
					<img
						src='/assets/icons/noactivity.svg'
						alt='empty state'
						className='h-80 w-80 p-0'
					/>
					<p className='p-0 text-xl font-bold'>No Activity Found</p>
					<p className='p-0 text-center text-[#243A57]'>
						Follow or Subscribe, to people and posts to view personalised <br />
						content on your feed!
					</p>
				</div>
			) : (
				<div className='flex h-[900px] w-[900px] flex-col items-center rounded-xl border border-solid border-[#D2D8E0] bg-white text-[#243A57]'>
					<img
						src='/assets/icons/nologin.svg'
						alt='empty state'
						className='h-80 w-80 p-0'
					/>
					<p className='p-0 text-xl font-bold'>Join Polkassembly to see your Following tab!</p>
					<p className='p-0 text-center text-[#243A57]'>Discuss, contribute and get regular updates from Polkassembly.</p>
					<LoginButton onClick={() => setLoginOpen(true)} />
					<SignupButton onClick={() => setSignupOpen(true)} />
				</div>
			)}
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

export default React.memo(LatestActivityFollowing);
