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

	const popupContent =
	<div className='pl-1 pr-5 py-1'>
		{identity?.legal &&
		<li className='my-1'>
			<span className='desc text-bodyBlue font-medium'>legal:&nbsp;</span>
			<span className='text-xs text-bodyBlue font-normal'>{identity.legal}</span>
		</li>
		}
		{identity?.email &&
		<li className='flex items-center my-1'>
			<span className='desc text-bodyBlue font-medium flex items-center text-sm'>
				<EmailIcon className='mr-0.5 pt-0.5'/>Email:&nbsp;
			</span>
			<span className='text-xs text-bodyBlue font-normal pt-0.5'>{identity.email}</span>
		</li>
		}
		{(identity?.judgements?.length || 0) > 0 &&
		<li className='flex items-center my-1'>
			<span className='desc flex items-center text-sm text-bodyBlue font-medium'><JudgementIcon className='mr-1'/>Judgements:&nbsp;</span>
			<span className='text-xs text-bodyBlue'>{displayJudgements}</span>
		</li>
		}
		{identity?.pgp &&
		<li className='flex items-center my-1'>
			<span className='desc text-bodyblue text-sm font-medium'>pgp:&nbsp;</span>
			<span className='text-xs text-bodyblue font-normal'>{identity.pgp}</span>
		</li>
		}
		{identity?.riot &&
		<li className='flex items-center my-1'>
			<span className='desc text-bodyblue text-sm font-medium'>riot:&nbsp;</span>
			<span className='text-xs text-bodyBlue font-normal'>{identity.riot}</span>
		</li>
		}
		{identity?.twitter &&
		<li className='flex items-center my-1'>
			<span className='desc text-bodyBlue font-medium flex text-sm'><TwitterIcon className='mr-1 mt-1'/>Twitter:&nbsp;</span>
			<span className='text-xs font-normal text-bodyBlue'>{identity.twitter}</span>
		</li>
		}
		{identity?.web &&
		<li className='flex items-center my-1'>
			<span className='desc text-bodyBlue font-medium text-sm'>Web:&nbsp;</span>
			<span className='text-xs text-bodyBlue font-normal'>{identity.web}</span>
		</li>
		}
		{flags?.isCouncil &&
		<li className='flex items-center my-1'>
			<span className='desc text-bodyBlue font-medium text-sm'>Council member:&nbsp;</span><CouncilEmoji/>
		</li>
		}
		{
			<li className='flex items-center my-1'>
				<span className='desc'><a href={`https://polkaverse.com/accounts/${address}`} target='_blank' rel='noreferrer' className='flex text-pink-500 underline items-center'><ShareScreenIcon className='mr-2'/>Polkaverse Profile</a>
				</span>
			</li>
		}
		{web3Name &&
		<li className='flex items-center my-1'>
			<span className='desc flex items-center'><a href={`https://w3n.id/${web3Name}`} target='_blank' rel='noreferrer' className='flex text-pink-500'><ShareScreenIcon className='mr-2'/>Web3 Name Profile</a>
			</span>
		</li>
		}
	</div>;

	return <div className={className}>
		<Tooltip color='#fff' title={popupContent}>
			{infoElem}
		</Tooltip>
	</div>;
};

export default styled(IdentityBadge)`
	li{
		line-height: 21px;
		list-style: none;
	}
	i.green.circle.icon {
		color: green_primary !important;
	}

	i.grey.circle.icon {
		color: grey_primary !important;
	}
`;
