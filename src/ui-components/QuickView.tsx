// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import copyToClipboard from '~src/util/copyToClipboard';
import { dmSans } from 'pages/_app';
import Address from './Address';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { ISocial } from '~src/auth/types';
import ImageComponent from 'src/components/ImageComponent';
import { network as AllNetworks } from '~src/global/networkConstants';
import JudgementIcon from '~assets/icons/judgement-icon.svg';
import ShareScreenIcon from '~assets/icons/share-icon-new.svg';
import { MinusCircleFilled } from '@ant-design/icons';
import { CopyIcon, VerifiedIcon } from './CustomIcons';
import { useDispatch } from 'react-redux';
import { setReceiver } from '~src/redux/tipping';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Tooltip from '~src/basic-components/Tooltip';
import { message } from 'antd';
import SocialsHandle from './SocialsHandle';
import classNames from 'classnames';
import Image from 'next/image';
import getEncodedAddress from '~src/util/getEncodedAddress';
import ScoreTag from './ScoreTag';
import { useTranslation } from 'next-i18next';

export const TippingUnavailableNetworks = [
	AllNetworks.MOONBASE,
	AllNetworks.MOONRIVER,
	AllNetworks.POLYMESH,
	AllNetworks.COLLECTIVES,
	AllNetworks.WESTENDCOLLECTIVES,
	AllNetworks.MOONBEAM,
	AllNetworks.EQUILIBRIUM,
	AllNetworks.LAOSSIGMA
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
	isKiltNameExists?: boolean;
	isW3FDelegate?: boolean;
	leaderboardAstrals?: number | null;
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
	enableTipping = true,
	isW3FDelegate = false,
	leaderboardAstrals
}: Props) => {
	const { t } = useTranslation('common');
	const { id, loginAddress } = useUserDetailsSelector();
	const judgements = identity?.judgements.filter(([, judgement]: any[]): boolean => !judgement?.FeePaid);
	const isGood = judgements?.some(([, judgement]: any[]): boolean => ['KnownGood', 'Reasonable'].includes(judgement));
	const isBad = judgements?.some(([, judgement]: any[]): boolean => ['Erroneous', 'LowQuality'].includes(judgement));
	const [messageApi, contextHolder] = message.useMessage();
	const [openTooltip, setOpenTooltip] = useState<boolean>(false);
	const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const substrateAddress = getEncodedAddress(address, network);
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

	const getUserRedirection = (username: string, address: string) => {
		if (!network) return null;
		if (username?.length) {
			return `https://${network}.polkassembly.io/user/${polkassemblyUsername}`;
		} else if (address?.length) {
			return `https://${network}.polkassembly.io/address/${address}`;
		}
		return null;
	};

	return (
		<div
			className={`${dmSans.variable} ${dmSans.className} flex flex-col gap-1.5 ${className} border-solid pb-2 dark:border-none`}
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
						{isW3FDelegate && (
							<Tooltip
								title='Web3 foundation delegate'
								className={classNames(dmSans.className, dmSans.variable)}
							>
								<Image
									src={'/assets/profile/w3f.svg'}
									alt=''
									width={24}
									height={24}
								/>
							</Tooltip>
						)}
						<a
							target='_blank'
							rel='noreferrer'
							className='flex text-pink_primary'
							onClick={(e) => {
								e.stopPropagation();
								e.preventDefault();
								window.open(getUserRedirection(polkassemblyUsername || '', address) || '', '_blank');
							}}
							// href={`${getUserRedirection(polkassemblyUsername || '', address)}` || ''}
						>
							<ShareScreenIcon />
						</a>
					</div>
					<div className={`flex gap-1.5 ${profileCreatedAt ? 'flex-col' : 'justify-between'}`}>
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
										copyToClipboard(substrateAddress || address);
										success();
									}}
								>
									{contextHolder}
									<CopyIcon className='-ml-[6px] scale-[70%] text-2xl text-lightBlue dark:text-icon-dark-inactive' />
								</span>
							</div>
						)}
						{!!leaderboardAstrals && !isNaN(leaderboardAstrals) && (
							<ScoreTag
								className='h-6 w-min px-[6px] py-1'
								score={leaderboardAstrals}
								iconWrapperClassName='mt-[5.5px]'
							/>
						)}
						<div className='mt-0.5 flex items-center justify-between gap-1 border-solid dark:border-none'>
							{!!profileCreatedAt && (
								<span className='flex items-center text-xs tracking-wide text-[#9aa7b9] dark:text-[#595959]'>
									{t('since')}:<span className='ml-0.5 text-lightBlue dark:text-blue-dark-medium'>{dayjs(profileCreatedAt).format('MMM DD, YYYY')}</span>
								</span>
							)}
							<SocialsHandle
								address={address}
								onchainIdentity={identity || null}
								socials={socials || []}
							/>
						</div>
					</div>
				</div>
			</div>
			{!!judgements && (
				<article className='v mt-2 flex h-11 items-center justify-center gap-1 rounded-lg border-[0.5px] border-solid border-[#EEF2F6] bg-[#F4F8FF] px-3 text-xs text-bodyBlue dark:border-[#5A5A5A] dark:bg-[#222222] dark:text-blue-dark-high'>
					<div className='flex items-center gap-1 font-medium text-lightBlue'>
						<JudgementIcon />
						<span className='dark:text-[#9E9E9E]'>{t('judgements')}:</span>
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
						<CustomButton
							onClick={handleTipping}
							variant='primary'
							text={t('tip')}
							height={32}
							className={`w-full p-5 ${!id || !enableTipping ? 'cursor-not-allowed opacity-50' : ''}`}
						/>
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
