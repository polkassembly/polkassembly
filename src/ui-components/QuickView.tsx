// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { UserOutlined } from '@ant-design/icons';
import copyToClipboard from '~src/util/copyToClipboard';
import { poppins } from 'pages/_app';
import Address from './Address';
import dayjs from 'dayjs';
import SocialLink from './SocialLinks';
import { socialLinks } from '~src/components/UserProfile/Details';
import { Button, Tooltip, message } from 'antd';
import styled from 'styled-components';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ISocial } from '~src/auth/types';
import ImageComponent from 'src/components/ImageComponent';
import Link from 'next/link';
import { network as AllNetworks } from '~src/global/networkConstants';

import JudgementIcon from '~assets/icons/judgement-icon.svg';
import ShareScreenIcon from '~assets/icons/share-icon-new.svg';
import { MinusCircleFilled } from '@ant-design/icons';
import CopyIcon from '~assets/icons/content_copy_small.svg';
import WebIcon from '~assets/icons/web-icon.svg';
import { PolkaverseIcon, VerifiedIcon } from './CustomIcons';
import { useDispatch } from 'react-redux';
import { setReceiver } from '~src/redux/Tipping';

export const TippingUnavailableNetworks = [
	AllNetworks.MOONBASE,
	AllNetworks.MOONRIVER,
	AllNetworks.POLYMESH,
	AllNetworks.COLLECTIVES,
	AllNetworks.WESTENDCOLLECTIVES,
	AllNetworks.MOONBEAM,
	AllNetworks.EQUILIBRIUM
];
interface Props {
	className?: string;
	address: string;
	identity?: DeriveAccountRegistration | null;
	polkassemblyUsername?: string;
	username: string;
	imgUrl?: string;
	profileCreatedAt?: Date | null;
	socials?: ISocial[];
	setOpen: (pre: boolean) => void;
	setOpenTipping: (pre: boolean) => void;
	setOpenAddressChangeModal: (pre: boolean) => void;
	enableTipping?: boolean;
}
const QuickView = ({
	className,
	address,
	identity,
	username,
	polkassemblyUsername,
	imgUrl,
	profileCreatedAt,
	setOpen,
	setOpenTipping,
	socials,
	setOpenAddressChangeModal,
	enableTipping = true
}: Props) => {
	const { id, loginAddress } = useUserDetailsSelector();
	const judgements = identity?.judgements.filter(([, judgement]): boolean => !judgement.isFeePaid);
	const isGood = judgements?.some(([, judgement]): boolean => judgement.isKnownGood || judgement.isReasonable);
	const isBad = judgements?.some(([, judgement]): boolean => judgement.isErroneous || judgement.isLowQuality);
	const [messageApi, contextHolder] = message.useMessage();
	const [openTooltip, setOpenTooltip] = useState<boolean>(false);
	const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const identityArr = [
		{ isVerified: !!identity?.twitter && isGood, key: 'Twitter', value: identity?.twitter || socials?.find((social) => social.type === 'Twitter')?.link || '' },
		{ isVerified: false, key: 'Telegram', value: socials?.find((social) => social.type === 'Telegram')?.link || '' },
		{ isVerified: !!identity?.email && isGood, key: 'Email', value: identity?.email || socials?.find((social) => social.type === 'Email')?.link || '' },
		{ isVerified: !!identity?.riot && isGood, key: 'Riot', value: identity?.riot || socials?.find((social) => social.type === 'Riot')?.link || '' }
	];
	const color: 'brown' | 'green' | 'grey' = isGood ? 'green' : isBad ? 'brown' : 'grey';
	const success = () => {
		messageApi.open({
			content: 'Address copied to clipboard',
			duration: 10,
			type: 'success'
		});
	};

	const handleTipping = () => {
		if (!id || !enableTipping) return;
		if (!loginAddress || !address) {
			setOpenAddressChangeModal?.(true);
		} else {
			setOpenTipping?.(true);
			dispatch(setReceiver(address));
		}
		setOpen(false);
	};

	return (
		<div
			className={`${poppins.variable} ${poppins.className} flex flex-col gap-1.5 ${className} border-solid pb-2 dark:border-none`}
			onClick={(e) => {
				e.stopPropagation();
				e.preventDefault();
			}}
		>
			<div className='flex flex-col gap-1.5 px-4'>
				<ImageComponent
					src={imgUrl}
					alt='User Picture'
					className='-mt-[50px] flex h-[98px] w-[98px] rounded-full border-[2px] border-solid border-white bg-white dark:border-none dark:border-[#3B444F]'
					iconClassName='flex items-center justify-center text-[#FCE5F2] text-2xl w-full h-full rounded-full'
				/>
				<div className={`flex ${!address && !profileCreatedAt ? 'mb-2 justify-between' : 'flex-col gap-1.5'}`}>
					<div className='mt-0 flex items-center justify-start gap-2'>
						<span className='text-xl font-semibold tracking-wide text-bodyBlue dark:text-blue-dark-high'>{username?.length > 15 ? `${username?.slice(0, 15)}...` : username}</span>
						<div className='flex items-center justify-center '>{isGood ? <VerifiedIcon className='text-xl' /> : <MinusCircleFilled style={{ color }} />}</div>
						<a
							target='_blank'
							rel='noreferrer'
							className='flex text-pink_primary'
							onClick={() => {
								const substrateAddress = address?.length ? getSubstrateAddress(address) : '';
								if (!polkassemblyUsername?.length) {
									window.open(`https://${network}.polkassembly.io/address/${substrateAddress || address}`, '_blank');
								} else {
									window.open(`https://${network}.polkassembly.io/user/${polkassemblyUsername}`, '_blank');
								}
							}}
						>
							<ShareScreenIcon />
						</a>
					</div>
					<div className={`flex  gap-1.5 ${profileCreatedAt ? 'flex-col' : 'justify-between'}`}>
						{!!address && (
							<div className='flex items-center gap-1 text-xs text-bodyBlue dark:text-blue-dark-high'>
								<Address
									address={address}
									disableHeader={network !== 'kilt'}
									iconSize={network === 'kilt' ? 26 : 20}
									addressMaxLength={5}
									addressClassName='text-sm dark:text-blue-dark-medium'
									disableTooltip
									showKiltAddress={network === 'kilt'}
								/>
								<span
									className='flex cursor-pointer items-center'
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
						)}
						<div className='mt-0.5 flex items-center justify-between gap-1 border-solid dark:border-none'>
							{profileCreatedAt && (
								<span className='flex items-center text-xs tracking-wide text-[#9aa7b9] dark:text-[#595959]'>
									Since:<span className='ml-0.5 text-lightBlue dark:text-blue-dark-medium'>{dayjs(profileCreatedAt).format('MMM DD, YYYY')}</span>
								</span>
							)}
							<div className='flex items-center gap-1.5'>
								{socialLinks?.map((social: any, index: number) => {
									const link = identityArr?.find((s) => s.key === social)?.value || '';
									const isVerified = identityArr.find((s) => s.key === social)?.isVerified || false;
									return (
										link && (
											<div
												title={link ? String(link) : ''}
												key={index}
											>
												<SocialLink
													className={`flex h-[24px] w-[24px] items-center justify-center rounded-full text-base hover:text-[#576D8B] ${
														isVerified ? 'bg-[#51D36E]' : 'bg-[#edeff3]'
													}`}
													link={link as string}
													type={social}
													iconClassName={`text-sm ${isVerified ? 'text-white' : 'text-[#96A4B6]'}`}
												/>
											</div>
										)
									);
								})}
								{!!identity?.web && (
									<Link
										target='_blank'
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											window.open(identity?.web, '_blank');
										}}
										href={identity?.web}
										title={identity?.web}
										className={`flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-full ${isGood ? 'bg-[#51D36E] text-white' : 'text-[#96A4B6]'}`}
									>
										<WebIcon />
									</Link>
								)}
								{address && (
									<Link
										target='_blank'
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											window.open(`https://polkaverse.com/accounts/${address}`, '_blank');
										}}
										title={`https://polkaverse.com/accounts/${address}`}
										href={`https://polkaverse.com/accounts/${address}`}
										className='flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-full bg-[#edeff3] text-xl'
									>
										<PolkaverseIcon />
									</Link>
								)}
								{network.includes('kilt') && (
									<Link
										target='_blank'
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											window.open(`https://w3n.id/${address}`, '_blank');
										}}
										title={`https://w3n.id/${address}`}
										href={`https://w3n.id/${address}`}
										className='flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#edeff3] text-[13px] text-[#96A4B6] hover:text-[#96A4B6]'
									>
										<UserOutlined />
									</Link>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
			{!!judgements && (
				<article className='v mt-2 flex h-11 items-center justify-center gap-1 rounded-lg border-[0.5px] border-solid border-[#EEF2F6] bg-[#F4F8FF] px-3 text-xs text-bodyBlue dark:border-[#5A5A5A] dark:bg-[#222222] dark:text-blue-dark-high'>
					<div className='flex items-center gap-1 font-medium text-lightBlue'>
						<JudgementIcon />
						<span className='dark:text-[#9E9E9E]'>Judgements:</span>
					</div>
					<span className='text-bodyBlue dark:text-blue-dark-high'>
						{judgements
							?.map(([, jud]) => jud.toString())
							.join(', ')
							?.split(',')?.[0] || 'None'}
					</span>
				</article>
			)}
			{!TippingUnavailableNetworks.includes(network) && (
				<Tooltip
					color='#E5007A'
					open={!id || !enableTipping ? openTooltip : false}
					onOpenChange={(e) => setOpenTooltip(e)}
					title={!id ? 'Login to tip' : 'No Web3 Wallet Detected'}
				>
					<div className='flex w-full items-center'>
						<Button
							onClick={handleTipping}
							className={`flex h-[32px] w-full items-center justify-center gap-0 rounded-[4px] border-pink_primary bg-[#FFEAF4] p-5 text-sm font-medium tracking-wide text-pink_primary ${
								(!id || !enableTipping) && 'cursor-not-allowed opacity-50'
							} dark:bg-[#33071E]`}
						>
							Tip
						</Button>
					</div>
				</Tooltip>
			)}
		</div>
	);
};

export default styled(QuickView)`
	.judgments {
		display: inline list-item;
	}
`;
