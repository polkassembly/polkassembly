// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect } from 'react';
import { Modal } from 'antd';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import CloseIcon from '~assets/icons/close.svg';
import SuccessIcon from '~assets/delegation-tracks/success-delegate.svg';
import MultisigSuccessIcon from '~assets/multi-vote-initiated.svg';
import UndelegateCloseIcon from '~assets/icons/white-close.svg';
import { poppins } from 'pages/_app';
import BN from 'bn.js';

import { useNetworkContext } from '~src/context';
import Address from '~src/ui-components/Address';
import { formatBalance } from '@polkadot/util';
import { chainProperties } from '~src/global/networkConstants';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { useRouter } from 'next/router';
import AbstainGray from '~assets/icons/abstainGray.svg';
import { EVoteDecisionType } from '~src/types';
import { DislikeFilled, LikeFilled } from '@ant-design/icons';
import SplitYellow from '~assets/icons/split-yellow-icon.svg';
import { formatedBalance } from '~src/util/formatedBalance';

interface Props{
  className?: string;
  open: boolean;
  setOpen: (pre:boolean) => void;
  tracks?: CheckboxValueType[];
  address?: string;
  isDelegate?: boolean;
  balance?: BN;
  trackNum?: number;
  conviction?: number;
  title?:string;
  vote?:EVoteDecisionType;
  votedAt?:string;
  ayeVoteValue?:BN;
  nayVoteValue?:BN;
  abstainVoteValue?:BN;
  isVote?:boolean;
  isMultisig?:boolean;
}

const DelegationSuccessPopup = ({ className, open, setOpen, tracks, address, isDelegate, balance, conviction , title = 'Delegated', vote ,votedAt, ayeVoteValue, nayVoteValue, abstainVoteValue,isVote = false, isMultisig }: Props) => {
	const { network } = useNetworkContext();
	const unit =`${chainProperties[network]?.tokenSymbol}`;
	const router = useRouter();
	useEffect(() => {
		if(!network) return ;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <Modal
		zIndex={100000}
		open={open}
		className={`${poppins.variable} ${poppins.className} ${isDelegate ? 'delegate' : 'undelegate'}`}
		wrapClassName={className}
		closeIcon={isDelegate ? <CloseIcon/> : <UndelegateCloseIcon/>}
		onCancel={() => { !isVote && router.reload() ; setOpen(false); }}
		centered
		footer={false}
		maskClosable={false}
	>
		<div className='flex justify-center items-center flex-col -mt-[132px]'>
			{isMultisig ? <MultisigSuccessIcon/> :<SuccessIcon/>}
			<h2 className='text-[20px] font-semibold tracking-[0.0015em] mt-4'>{isDelegate ? isMultisig ? `${title}`: `${title} successfully` : isMultisig ? `${title}`: 'Undelegated successfully' }</h2>
			{isDelegate && <div className='flex flex-col justify-center items-center gap-[14px]'>
				{balance && <div className='text-pink_primary text-[24px] font-semibold'>{formatedBalance(balance.toString(), unit)}{` ${unit}`}</div>}
				{
					vote === EVoteDecisionType.SPLIT && <div className=' flex flex-wrap justify-center font-normal text-sm text-blue-light-high dark:text-blue-dark-high'> <span className='mr-3'><span className='font-semibold'> Aye: </span><span className='font-normal'>{ayeVoteValue ? formatedBalance(ayeVoteValue.toString(), unit) : 0}{` ${unit}`}</span></span> <span className='mr-3'><span className='font-semibold'>Nay: </span><span className='font-normal'>{nayVoteValue ? formatedBalance(nayVoteValue.toString(), unit)  : 0}{` ${unit}`}</span></span></div>
				}
				{
					vote === EVoteDecisionType.ABSTAIN &&  <div className='flex flex-wrap justify-center font-normal text-sm text-blue-light-high dark:text-blue-dark-high'> <span className='mr-3'><span className='font-semibold'> Abstain:</span> <span className='font-normal'>{abstainVoteValue ? formatedBalance(abstainVoteValue.toString(), unit) : 0}{` ${unit}`}</span></span> <span className='mr-3'> <span className='font-semibold'>Aye:</span> <span className='font-normal'> {ayeVoteValue ? formatedBalance(ayeVoteValue.toString(), unit) : 0}{` ${unit}`}</span></span> <span className='mr-3'><span className='font-semibold'>Nay:</span> <span className='font-normal'>{nayVoteValue ? formatedBalance(nayVoteValue.toString(), unit)  : 0}{` ${unit}`}</span></span></div>
				}
				<div className='flex-col flex items-start justify-center gap-[10px]'>
					{address && <div className='flex gap-3 text-sm text-[#485F7D] font-normal'>{isVote ? 'With' : 'To'} address:<span className='font-medium'>
						<Address address={address}
							className='address'
							displayInline={true}/>
					</span>
					</div>}
					{vote && <div className='flex h-[21px] gap-[70px] text-sm text-[#485F7D] font-normal'>
						Vote :{vote === EVoteDecisionType.AYE ? <p><LikeFilled className='text-[green]'/> <span className='capitalize font-medium text-blue-light-high dark:text-blue-dark-high'>{vote}</span></p> : vote === EVoteDecisionType.NAY ?  <div><DislikeFilled className='text-[red]'/> <span className='mb-[5px] capitalize font-medium text-blue-light-high dark:text-blue-dark-high'>{vote}</span></div> : vote === EVoteDecisionType.SPLIT ? <p><SplitYellow/> <span className='capitalize font-medium text-blue-light-high dark:text-blue-dark-high'>{vote}</span></p> : vote === EVoteDecisionType.ABSTAIN ? <p className='flex align-middle'><AbstainGray className='mr-1'/> <span className='capitalize font-medium text-blue-light-high dark:text-blue-dark-high'>{vote}</span></p> : null }
					</div>
					}
					<div className='flex gap-[30px] text-sm text-[#485F7D] font-normal'> Conviction:<span className='text-blue-light-high dark:text-blue-dark-high font-medium'>{conviction}x</span> </div>
					{tracks && <div className='flex gap-[35px] text-sm text-[#485F7D]'>Track(s):<span>
						<div className={`flex flex-col gap-1 min-h-[50px] max-h-[100px] text-blue-light-high dark:text-blue-dark-high pr-2 font-medium ${tracks.length > 4 && 'overflow-y-scroll'}`}>
							{tracks.map((track, index) => (<div key={index}>{track} #{networkTrackInfo[network][track.toString()].trackId}</div>))}</div>
					</span>
					</div>}
					{votedAt && <div className='flex h-[21px] gap-[14px] text-sm text-[#485F7D] font-normal'>
						Time of Vote : <span className='font-medium text-blue-light-high dark:text-blue-dark-high'>{votedAt}</span>
					</div>
					}
				</div></div>}
		</div>

	</Modal>;
};

export default DelegationSuccessPopup;
