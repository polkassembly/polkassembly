// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, message } from 'antd';

import React, { FC, useContext, useEffect, useState } from 'react';
// import { ProfileIcon } from '~src/ui-components/CustomIcons';
import ImageComponent from '~src/components/ImageComponent';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { MinusCircleFilled } from '@ant-design/icons';
import { DeriveAccountInfo, DeriveAccountRegistration } from '@polkadot/api-derive/types';

import CopyIcon from '~assets/icons/content_copy_small.svg';
// import WebIcon from '~assets/icons/web-icon.svg';
// import { VerifiedIcon } from './CustomIcons';

import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import { VerifiedIcon } from '~src/ui-components/CustomIcons';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { useNetworkSelector } from '~src/redux/selectors';
import { ApiPromise } from '@polkadot/api';
import { ApiContext } from '~src/context/ApiContext';
import copyToClipboard from '~src/util/copyToClipboard';
import EvalutionSummary from '../../PostSummary/EvalutionSummary';
import MessageIcon from '~assets/icons/ChatIcon.svg';
import ClipBoardIcon from '~assets/icons/ClipboardText.svg';
import CalenderIcon from '~assets/icons/Calendar.svg';
import { network as AllNetworks } from '~src/global/networkConstants';

interface IBeneficiariesTab {
	className?: string;
	address?: any;
}

const ProposerData: FC<IBeneficiariesTab> = (className, address) => {
	const apiContext = useContext(ApiContext);
	const { network } = useNetworkSelector();
	const [apiReady, setApiReady] = useState(false);
	const [api, setApi] = useState<ApiPromise>();
	useEffect(() => {
		if (network === AllNetworks.COLLECTIVES && apiContext.relayApi && apiContext.relayApiReady) {
			setApi(apiContext.relayApi);
			setApiReady(apiContext.relayApiReady);
		} else {
			if (!apiContext.api || !apiContext.apiReady) return;
			setApi(apiContext.api);
			setApiReady(apiContext.apiReady);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, apiContext.api, apiContext.apiReady, apiContext.relayApi, apiContext.relayApiReady, address]);

	const [identity, setIdentity] = useState<DeriveAccountRegistration>();
	const [messageApi, contextHolder] = message.useMessage();

	const encodedAddr = address ? getEncodedAddress(address, network) || '' : '';
	const [profileData, setProfileData] = useState<IGetProfileWithAddressResponse | undefined>();
	useEffect(() => {
		fetchUsername(address);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const success = () => {
		messageApi.open({
			content: 'Address copied to clipboard',
			duration: 10,
			type: 'success'
		});
	};

	useEffect(() => {
		if (!api || !apiReady || !address || !encodedAddr) return;
		handleIdentityInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, address, encodedAddr, network]);

	const handleIdentityInfo = () => {
		api?.derive.accounts.info(encodedAddr, (info: DeriveAccountInfo) => {
			setIdentity(info.identity);
		});
	};

	const judgements = identity?.judgements.filter(([, judgement]): boolean => !judgement.isFeePaid);
	const isGood = judgements?.some(([, judgement]): boolean => judgement.isKnownGood || judgement.isReasonable);

	const fetchUsername = async (address: string) => {
		const substrateAddress = getSubstrateAddress(address);

		if (substrateAddress) {
			try {
				const { data, error } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`api/v1/auth/data/profileWithAddress?address=${substrateAddress}`, undefined, 'GET');
				if (error || !data || !data.username) {
					return;
				}
				setProfileData(data);
			} catch (error) {
				// console.log(error);
			}
		}
	};
	console.log(profileData);

	return (
		<div className={`${className}`}>
			<div className='flex gap-x-4'>
				<div className='h-[60px] w-[60px]'>
					<ImageComponent
						src={profileData?.profile?.image}
						alt='User Picture'
						className='flex h-[60px] w-[60px] items-center justify-center bg-transparent'
						iconClassName='flex items-center justify-center text-[#FCE5F2] text-xxl w-full h-full rounded-full'
					/>
				</div>
				<div>
					<div className='flex gap-x-1'>
						<p className='text-base font-semibold text-bodyBlue dark:text-white'>
							{profileData?.username && profileData?.username?.length > 15 ? `${profileData?.username?.slice(0, 15)}...` : profileData?.username}
						</p>
						<p className='w-[120px] truncate text-base text-bodyBlue dark:text-white'>({address})</p>
						<div className='mt-0.5'>{isGood ? <VerifiedIcon className='text-xl' /> : <MinusCircleFilled />}</div>
						<span
							className='-mt-4 flex cursor-pointer items-center'
							onClick={(e) => {
								e.preventDefault();
								copyToClipboard(address);
								success();
							}}
						>
							{contextHolder}
							<CopyIcon />
						</span>
					</div>
					{!profileData?.profile?.bio && (
						<div>
							<p className='text-sm text-textGreyColor'>
								Lorem ipsum dolor, sit amet consectetur adipisicing elit. Reiciendis, voluptatibus, eum enim sunt et alias repudiandae repellat molestias quis odit, quia illo quod
								molestiae accusantium fuga hic commodi esse. Consequuntur quas reiciendis pariatur officia rerum, perspiciatis temporibus quae necessitatibus sed atque debitis
								minus enim unde nam modi qui deleniti quibusdam exercitationem illo et magnam at iure? Accusamus nesciunt sint mollitia.
							</p>
							<p className='text-sm text-textGreyColor'>{profileData?.profile?.bio}</p>
						</div>
					)}
					<div>
						<EvalutionSummary isUsedInEvaluationTab={true} />
					</div>
				</div>
			</div>
			<Divider
				style={{ background: '#D2D8E0', flexGrow: 1 }}
				className='mb-0 mt-2 dark:bg-separatorDark'
			/>
			<div className='mt-2 flex h-[60px] divide-x divide-gray-300'>
				<div className='flex w-1/4 items-center justify-center p-4'>
					<CalenderIcon />
					<div>hello 1</div>
				</div>
				<Divider
					type='vertical'
					className='h-[40px]'
				/>
				<div className='flex w-1/4 items-center justify-center p-4'>
					<ClipBoardIcon />
					<div>hello 2</div>
				</div>
				<Divider
					type='vertical'
					className='h-[40px]'
				/>
				<div className='flex w-1/4 items-center justify-center p-4'>
					<MessageIcon />
					<div>Hello 3</div>
				</div>
				<Divider
					type='vertical'
					className='h-[40px]'
				/>
				<div className='flex w-1/4 items-center justify-center p-4'>
					<MessageIcon />
					<div>Hello 4</div>
				</div>
			</div>
		</div>
	);
};

export default ProposerData;
