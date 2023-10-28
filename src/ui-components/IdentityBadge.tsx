// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckCircleFilled, MinusCircleFilled } from '@ant-design/icons';
import { DeriveAccountFlags, DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { Tooltip, Skeleton, message } from 'antd';
import React from 'react';
import styled from 'styled-components';
import VerifiedIcon from '~assets/icons/verified-icon.svg';
import EmailIcon from '~assets/icons/email-icon.svg';
import LegalIcon from '~assets/icons/legal-icon.svg';
import JudgementIcon from '~assets/icons/judgement-icon.svg';
import TwitterIcon from '~assets/icons/twitter-icon.svg';
import WebIcon from '~assets/icons/web-icon.svg';
import RiotIcon from '~assets/icons/riot-icon.svg';
import ShareScreenIcon from '~assets/icons/share-icon-new.svg';
import PgpIcon from '~assets/icons/pgp-icon.svg';
import dynamic from 'next/dynamic';
import { useNetworkSelector } from '~src/redux/selectors';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import CopyIcon from '~assets/icons/content_copy_small.svg';
import copyToClipboard from '~src/util/copyToClipboard';

const ImageComponent = dynamic(() => import('src/components/ImageComponent'), {
	loading: () => <Skeleton.Avatar active />,
	ssr: false
});
interface Props {
	className?: string;
	address: string;
	identity?: DeriveAccountRegistration | null;
	flags?: DeriveAccountFlags;
	web3Name?: string;
	addressPrefix?: string;
	imgUrl?: string;
	sinceDate?: Date;
	addressShort: string;
}

export interface INetworkWalletErr {
	message: string;
	description: string;
	error: number;
}

const StyledPopup = styled.div`
	font-size: sm;
	list-style: none;
	padding: 0.75rem 0.5rem;
	border-radius: 8px;

	li {
		margin-bottom: 0.3rem;
	}

	.desc {
		font-weight: 500;
		margin-right: 0.3rem;
	}

	.judgments {
		display: inline list-item;
	}
`;

const IdentityBadge = ({ className, address, identity, flags, addressPrefix, imgUrl, sinceDate, addressShort }: Props) => {
	const judgements = identity?.judgements.filter(([, judgement]): boolean => !judgement.isFeePaid);
	const isGood = judgements?.some(([, judgement]): boolean => judgement.isKnownGood || judgement.isReasonable);
	const isBad = judgements?.some(([, judgement]): boolean => judgement.isErroneous || judgement.isLowQuality);
	const [messageApi, contextHolder] = message.useMessage();

	const success = () => {
		messageApi.open({
			content: 'Address copied to clipboard',
			duration: 10,
			type: 'success'
		});
	};

	const { network } = useNetworkSelector();
	const identityArr = [
		{ key: 'Email', value: identity?.email },
		{ key: 'Judgements', value: identity?.judgements || [] },
		{ key: 'Legal', value: identity?.legal },
		{ key: 'Pgp', value: identity?.pgp },
		{ key: 'Riot', value: identity?.riot },
		{ key: 'Twitter', value: identity?.twitter },
		{ key: 'Web', value: identity?.web }
	];

	const color: 'brown' | 'green' | 'grey' = isGood ? 'green' : isBad ? 'brown' : 'grey';
	const CouncilEmoji = () => (
		<span
			aria-label='council member'
			className='-mt-1'
			role='img'
		>
			👑
		</span>
	);
	const infoElem = (
		<span className='flex items-center'>
			{isGood ? <CheckCircleFilled style={{ color }} /> : <MinusCircleFilled style={{ color }} />}
			<span className='w-1'></span>
			{flags?.isCouncil && <CouncilEmoji />}
		</span>
	);

	const getIdentityIcons = (key: string) => {
		switch (key) {
			case 'Legal':
				return <LegalIcon className='mx-1' />;
			case 'Email':
				return <EmailIcon className='mx-1' />;
			case 'Pgp':
				return <PgpIcon className='mx-1' />;
			case 'Riot':
				return <RiotIcon className='mx-1' />;
			case 'Twitter':
				return <TwitterIcon className='mx-1' />;
			case 'Web':
				return <WebIcon className='mx-1' />;
		}
	};
	// const displayJudgements = JSON.stringify(judgements?.map(([, jud]) => jud.toString()));
	const popupContent = (
		<>
			<StyledPopup>
				<ImageComponent
					src={imgUrl}
					alt='User Picture'
					className='absolute left-[25%] top-[-5%] flex h-[95px] w-[95px] -translate-x-1/2 -translate-y-1/2 bg-transparent'
					iconClassName='flex items-center justify-center text-[#FCE5F2] text-2xl w-full h-full rounded-full'
				/>
				<div className='mb-0 mt-6 flex items-center'>
					<h3 className='whitespace-pre text-[15px] font-semibold text-bodyBlue'>{addressPrefix}</h3>
					{isGood ? (
						<VerifiedIcon className='ml-1.5 mt-[-5px]' />
					) : (
						<MinusCircleFilled
							className='ml-1 mt-[-6px]'
							style={{ color }}
						/>
					)}
					<a
						target='_blank'
						rel='noreferrer'
						className='flex text-pink-500'
						onClick={(e) => {
							e.stopPropagation();
							e.preventDefault();
							const substrateAddress = getSubstrateAddress(address);
							if (addressPrefix) {
								return window.open(`https://${network}.polkassembly.io/address/${substrateAddress}`, '_blank');
							}
							return window.open(`https://${network}.polkassembly.io/user/${addressPrefix}`, '_blank');
						}}
					>
						<ShareScreenIcon className='ml-1 mr-2 mt-[-5px]' />
					</a>
				</div>
				<div className='-mt-0.5 mb-1 flex text-xs text-bodyBlue'>
					<span>{addressShort}</span>
					<span
						className='ml-2 flex cursor-pointer items-center'
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
				<div className='flex items-center justify-between'>
					<p className='mb-0.5 text-xs text-[#576D8B99]'>
						Since:
						<span className='text-lightBlue'>{sinceDate?.toLocaleDateString()}</span>
					</p>
					<div className='flex items-center'>
						{identityArr.map((item, index) => {
							return (
								<Tooltip
									color='#575255'
									key={index}
									title={JSON.stringify(item?.value)}
								>
									{/* item should not be judgements */}
									{JSON.stringify(item?.value) && item?.key !== 'Judgements' ? (
										<span className='px-auto ml-1 h-[20px] w-[22px] cursor-pointer rounded-xl bg-[#EDEFF3] text-bodyBlue '>
											{item?.key !== 'Judgements' && getIdentityIcons(item?.key)}
										</span>
									) : null}
								</Tooltip>
							);
						})}
					</div>
				</div>
				<article className='mx-auto mt-2 flex h-11 w-48 rounded-lg bg-[#F4F8FF] text-xs text-bodyBlue'>
					<div className='m-auto flex items-center'>
						<span className='font-medium text-lightBlue'>
							<JudgementIcon className='mx-1' />
							Judgements:
						</span>
						<div className='ml-1 mt-0.5'>{judgements?.map(([, jud]) => jud.toString()).join(', ') || 'None'}</div>
					</div>
				</article>
			</StyledPopup>
		</>
	);

	return (
		<div className={className}>
			<Tooltip
				color='#fff'
				title={popupContent}
			>
				<div>{infoElem}</div>
			</Tooltip>
		</div>
	);
};

export default styled(IdentityBadge)`
	i.green.circle.icon {
		color: green_primary !important;
	}

	i.grey.circle.icon {
		color: grey_primary !important;
	}
`;
