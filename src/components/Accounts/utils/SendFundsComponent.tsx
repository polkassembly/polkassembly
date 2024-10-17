// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from 'antd';
import { poppins } from 'pages/_app';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import dynamic from 'next/dynamic';
import Skeleton from '~src/basic-components/Skeleton';

const Tipping = dynamic(() => import('src/components/Tipping'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface Props {
	address: string;
}

interface IUsernameProfile {
	username: string;
}

const SendFundsComponent = ({ address }: Props) => {
	const [openTipping, setOpenTipping] = useState<boolean>(false);
	const [tippingUser, setTippingUser] = useState<string>('');
	const [openAddressChangeModal, setOpenAddressChangeModal] = useState<boolean>(false);
	const [profileDetails, setProfileDetails] = useState<IUsernameProfile>({
		username: ''
	});

	const getData = async (address: string) => {
		try {
			const { data, error } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`api/v1/auth/data/profileWithAddress?address=${address}`, undefined, 'GET');
			if (error || !data || !data.username || !data.user_id) {
				return;
			}
			setProfileDetails({
				username: data?.username
			});
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		getData(address);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	return (
		<div>
			<Button
				onClick={() => {
					setTippingUser(address);
					setOpenTipping(true);
				}}
				// disabled={}
				// loading={loading}
				htmlType='submit'
				className={'my-0 flex h-8 items-center rounded-md border-none bg-[#E5007A] pl-[10px] text-white hover:bg-pink_secondary '}
			>
				<div>
					<Image
						className='-mt-[2.5px] h-5 w-5 rounded-full object-contain'
						src={'/assets/icons/accounts/funds-icon.svg'}
						alt='Logo'
						width={20}
						height={20}
					/>
					<span className={`${poppins.className} ${poppins.variable} ml-[4px] text-sm font-medium`}>Send Funds</span>
				</div>
			</Button>
			{address && (
				<Tipping
					username={profileDetails?.username || tippingUser || ''}
					open={openTipping}
					setOpen={setOpenTipping}
					key={address}
					paUsername={profileDetails?.username}
					setOpenAddressChangeModal={setOpenAddressChangeModal}
					openAddressChangeModal={openAddressChangeModal}
					isUsedInAccountsPage={true}
				/>
			)}
		</div>
	);
};

export default SendFundsComponent;
