// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckCircleFilled, MinusCircleFilled } from '@ant-design/icons';
import { DeriveAccountFlags, DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { Tooltip } from 'antd';
import EmailIcon from '~assets/icons/mail-icon.svg';
import JudgementIcon from '~assets/icons/account-box-icon.svg';
import TwitterIcon from '~assets/icons/twitter-icon.svg';
import ShareScreenIcon from '~assets/icons/screen-share-icon.svg';
import React from 'react';
import styled from 'styled-components';

const StyledPopup = styled.div`
font-size: sm;
color: var(--grey_primary);
list-style: none;
padding: 0.5rem 1rem;

li {
	margin-bottom: 0.3rem;
}

.desc {
	font-weight: 500;
}

.judgments {
	display: inline list-item;
}
`;

interface Props {
	className?: string,
	address: string,
	identity?: DeriveAccountRegistration | null,
	flags?: DeriveAccountFlags,
	web3Name?: string
}

const IdentityBadge = ({ className, address, identity, flags, web3Name }: Props) => {
	const judgements = identity?.judgements.filter(([, judgement]): boolean => !judgement.isFeePaid);
	const isGood = judgements?.some(([, judgement]): boolean => judgement.isKnownGood || judgement.isReasonable);
	const isBad = judgements?.some(([, judgement]): boolean => judgement.isErroneous || judgement.isLowQuality);

	const color: 'brown' | 'green' | 'grey' = isGood ? 'green' : isBad ? 'brown' : 'grey';
	const CouncilEmoji = () => <span aria-label="council member" className='-mt-1' role="img">👑</span>;
	const infoElem = <span className='flex items-center'>
		{isGood ? <CheckCircleFilled style={ { color } } /> : <MinusCircleFilled style={ { color } } />}
		<span className='w-1'></span>
		{flags?.isCouncil && <CouncilEmoji/>}
	</span>;

	const displayJudgements = JSON.stringify(judgements?.map(([,jud]) => jud.toString()));

	const popupContent = <StyledPopup>
		{identity?.legal && <li><span className='desc'>legal:</span><span className='text-xs'>{identity.legal}</span></li>}
		{identity?.email && <li className='flex items-center'><span className='desc flex items-center text-sm'><EmailIcon className='mr-1'/>Email:</span><span className='text-xs'>{identity.email}</span></li>}
		{(identity?.judgements?.length || 0) > 0 && <li className='flex items-center'><span className='desc flex items-center text-sm'><JudgementIcon className='mr-1'/>Judgements:</span><span className='judgments'><span className='text-xs'>{displayJudgements}</span></span></li>}
		{identity?.pgp && <li><span className='desc'>pgp:</span><span className='text-xs'>{identity.pgp}</span></li>}
		{identity?.riot && <li><span className='desc'>riot:</span><span className='text-xs'>{identity.riot}</span></li>}
		{identity?.twitter && <li className='flex items-center'><span className='desc flex text-sm'><TwitterIcon className='mr-1 mt-1'/>Twitter:</span><span className='text-xs'>{identity.twitter}</span></li>}
		{identity?.web && <li><span className='desc'>web:</span><span className='text-xs'>{identity.web}</span></li>}
		{flags?.isCouncil && <li><span className='desc'>Council member</span><CouncilEmoji/></li>}
		{<li><span className='desc'><a href={`https://polkaverse.com/accounts/${address}`} target='_blank' rel='noreferrer' className='flex text-pink-500 underline items-center'><ShareScreenIcon className='mr-2'/>Polkaverse Profile</a></span></li>}
		{web3Name && <li><span className='desc flex items-center'><a href={`https://w3n.id/${web3Name}`} target='_blank' rel='noreferrer' className='flex text-pink-500'><ShareScreenIcon className='mr-2'/>Web3 Name Profile</a></span></li>}
	</StyledPopup>;

	return <div className={className}>
		<Tooltip color='#fff' title={popupContent}>
			{infoElem}
		</Tooltip>
	</div>;
};

export default styled(IdentityBadge)`
	display: inline;

	i.green.circle.icon {
		color: green_primary !important;
	}

	i.grey.circle.icon {
		color: grey_primary !important;
	}
`;
