// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckCircleFilled, MinusCircleFilled } from '@ant-design/icons';
import { DeriveAccountFlags, DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { Tooltip } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { EmailIcon, JudgementIcon, LegalIcon, PgpIcon, RiotIcon, ShareScreenIcon, TwitterIcon, WebIcon } from '~src/ui-components/CustomIcons';

interface Props {
	className?: string;
	address: string;
	identity?: DeriveAccountRegistration | null;
	flags?: DeriveAccountFlags;
	web3Name?: string;
	theme?: string;
}

const StyledPopup = styled.div`
	font-size: sm;
	list-style: none;
	padding: 1rem;

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

const getIdentityIcons = (key: string) => {
	switch (key) {
		case 'Legal':
			return <LegalIcon className='mr-1.5 text-lightBlue dark:text-icon-dark-inactive' />;
		case 'Email':
			return <EmailIcon className='mr-2 text-lightBlue dark:text-icon-dark-inactive' />;
		case 'Judgements':
			return <JudgementIcon className='mr-1.5 text-lightBlue dark:text-icon-dark-inactive' />;
		case 'Pgp':
			return <PgpIcon className='mr-1 text-lightBlue dark:text-icon-dark-inactive' />;
		case 'Riot':
			return <RiotIcon className='mr-1.5 text-lightBlue dark:text-icon-dark-inactive' />;
		case 'Twitter':
			return <TwitterIcon className='mr-1.5 mt-1 text-lightBlue dark:text-icon-dark-inactive' />;
		case 'Web':
			return <WebIcon className='text-lightBlue dark:text-icon-dark-inactive' />;
	}
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const IdentityBadge = ({ className, address, identity, flags, web3Name, theme }: Props) => {
	const judgements = identity?.judgements.filter(([, judgement]): boolean => !judgement.isFeePaid);
	const isGood = judgements?.some(([, judgement]): boolean => judgement.isKnownGood || judgement.isReasonable);
	const isBad = judgements?.some(([, judgement]): boolean => judgement.isErroneous || judgement.isLowQuality);
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

	const displayJudgements = JSON.stringify(judgements?.map(([, jud]) => jud.toString()));
	const popupContent = (
		<StyledPopup className='dark:bg-section-dark-overlay'>
			{identityArr.map((item, index) => {
				{
					return (
						(item?.key === 'Judgements' ? !!identity?.judgements?.length : !!item?.value) && (
							<li
								className='flex items-center'
								key={index}
							>
								<span className='desc flex items-center text-sm font-medium capitalize text-bodyBlue dark:text-blue-dark-high'>
									{getIdentityIcons(item?.key)}
									{item?.key}:
								</span>
								<span className='truncate pt-0.5 text-xs font-normal text-bodyBlue dark:text-blue-dark-high'>
									{(item?.key === 'Judgements' ? displayJudgements : item?.value) as string}
								</span>
							</li>
						)
					);
				}
			})}

			{flags?.isCouncil && (
				<li className='flex items-center'>
					<span className='desc text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
						<CouncilEmoji /> Council member{' '}
					</span>
				</li>
			)}
			{
				<li className='flex items-center'>
					<span className='desc'>
						<a
							href={`https://polkaverse.com/accounts/${address}`}
							target='_blank'
							rel='noreferrer'
							className='flex items-center text-pink-500 underline'
							onClick={(e) => {
								e.stopPropagation();
								e.preventDefault();
								window.open(`https://polkaverse.com/accounts/${address}`, '_blank');
							}}
						>
							<ShareScreenIcon className='mr-2' />
							Polkaverse Profile
						</a>
					</span>
				</li>
			}
			{web3Name && (
				<li className='flex items-center'>
					<span className='desc flex items-center'>
						<a
							href={`https://w3n.id/${web3Name}`}
							target='_blank'
							rel='noreferrer'
							className='flex text-pink-500'
							onClick={(e) => {
								e.stopPropagation();
								e.preventDefault();
								window.open(`https://w3n.id/${web3Name}`, '_blank');
							}}
						>
							<ShareScreenIcon className='mr-2' />
							Web3 Name Profile
						</a>
					</span>
				</li>
			)}
		</StyledPopup>
	);

	return (
		<div className={className}>
			<Tooltip
				color={theme === 'dark' ? '#0D0D0D' : 'white'}
				title={popupContent}
			>
				{infoElem}
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
