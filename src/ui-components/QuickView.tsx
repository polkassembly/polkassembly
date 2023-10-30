// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import CopyIcon from '~assets/icons/content_copy_small.svg';
import copyToClipboard from '~src/util/copyToClipboard';
import { poppins } from 'pages/_app';
import Address from './Address';
import dayjs from 'dayjs';
import SocialLink from './SocialLinks';
import { socialLinks } from '~src/components/UserProfile/Details';
import dynamic from 'next/dynamic';
import { Skeleton, message } from 'antd';
import styled from 'styled-components';
import VerifiedIcon from '~assets/icons/verified-tick.svg';
import JudgementIcon from '~assets/icons/judgement-icon.svg';
import ShareScreenIcon from '~assets/icons/share-icon-new.svg';
import { MinusCircleFilled } from '@ant-design/icons';
import { useNetworkSelector } from '~src/redux/selectors';

const ImageComponent = dynamic(() => import('src/components/ImageComponent'), {
	loading: () => <Skeleton.Avatar active />,
	ssr: false
});

interface Props {
	className?: string;
	address: string;
	identity?: DeriveAccountRegistration | null;
	polkassemblyUsername?: string;
	username: string;
	imgUrl?: string;
	profileCreatedAt?: Date;
}
const QuickView = ({ className, address, identity, username, polkassemblyUsername, imgUrl, profileCreatedAt }: Props) => {
	const judgements = identity?.judgements.filter(([, judgement]): boolean => !judgement.isFeePaid);
	const isGood = judgements?.some(([, judgement]): boolean => judgement.isKnownGood || judgement.isReasonable);
	const isBad = judgements?.some(([, judgement]): boolean => judgement.isErroneous || judgement.isLowQuality);
	const [messageApi, contextHolder] = message.useMessage();

	const { network } = useNetworkSelector();
	const identityArr = [
		{ key: 'Email', value: identity?.email },
		{ key: 'Judgements', value: identity?.judgements || [] },
		{ key: 'Legal', value: identity?.legal },
		{ key: 'Riot', value: identity?.riot },
		{ key: 'Twitter', value: identity?.twitter },
		{ key: 'Web', value: identity?.web }
	];
	const color: 'brown' | 'green' | 'grey' = isGood ? 'green' : isBad ? 'brown' : 'grey';
	const success = () => {
		messageApi.open({
			content: 'Address copied to clipboard',
			duration: 10,
			type: 'success'
		});
	};

	return (
		<div className={`${poppins.variable} ${poppins.className} flex flex-col gap-1.5 px-6 ${className} pb-2`}>
			<div>
				<ImageComponent
					src={imgUrl}
					alt='User Picture'
					className='absolute left-[25%] top-[-4%] flex h-[95px] w-[95px] -translate-x-1/2 -translate-y-1/2 bg-transparent'
					iconClassName='flex items-center justify-center text-[#FCE5F2] text-2xl w-full h-full rounded-full'
				/>
			</div>
			<div className='mt-8 flex items-center justify-start gap-2'>
				<span className='text-xl font-semibold tracking-wide text-bodyBlue'>{username?.length > 20 ? `${username?.slice(0, 20)}...` : username}</span>
				<div className='flex items-center justify-center'>{isGood ? <VerifiedIcon /> : <MinusCircleFilled style={{ color }} />}</div>
				<a
					target='_blank'
					rel='noreferrer'
					className='flex text-pink_primary'
					onClick={() => {
						const substrateAddress = getSubstrateAddress(address);
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
			<div className='flex items-center gap-2 text-xs text-bodyBlue'>
				<Address
					address={address}
					disableHeader
					iconSize={20}
					addressMaxLength={5}
					addressClassName='text-sm'
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
			<div className='flex items-center justify-between gap-1 border-solid'>
				<span className='text-xs tracking-wide text-[#7C899A]'>Since: {dayjs(profileCreatedAt).format('MMM DD, YYYY')}</span>
				<div className='flex items-center gap-1.5'>
					{socialLinks?.map((social: any, index: number) => {
						const link = identityArr?.find((s) => s.key === social)?.value || '';
						return (
							<div
								title={link ? String(link) : ''}
								key={index}
							>
								<SocialLink
									className={`flex h-[20px] w-[20px] items-center justify-center rounded-[20px] text-xs hover:text-[#576D8B] ${link ? 'bg-[#51D36E]' : 'bg-[#edeff3]'}`}
									link={link as string}
									type={social}
									iconClassName={`text-xs ${link ? 'text-white' : 'text-[#96A4B6]'}`}
								/>
							</div>
						);
					})}
				</div>
			</div>
			<article className='mt-1 flex h-11 items-center justify-center gap-1 rounded-lg bg-[#F4F8FF] px-3 text-xs text-bodyBlue'>
				<div className='flex items-center gap-1 font-medium text-lightBlue'>
					<JudgementIcon />
					<span>Judgements:</span>
				</div>
				<span className='text-bodyBlue'>
					{judgements
						?.map(([, jud]) => jud.toString())
						.join(', ')
						?.split(',')?.[0] || 'None'}
				</span>
			</article>
		</div>
	);
};

export default styled(QuickView)`
	.judgments {
		display: inline list-item;
	}
`;
