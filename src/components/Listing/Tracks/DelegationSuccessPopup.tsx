// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect } from 'react';
import { Modal } from 'antd';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { CloseIcon } from '~src/ui-components/CustomIcons';
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

<<<<<<< HEAD
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
  theme?:string;
}

const DelegationSuccessPopup = ({ className, open, setOpen, tracks, address, isDelegate, balance, conviction , title = 'Delegated', vote ,votedAt, ayeVoteValue, nayVoteValue, abstainVoteValue,isVote = false, isMultisig,theme }: Props) => {
=======
interface Props {
	className?: string;
	open: boolean;
	setOpen: (pre: boolean) => void;
	tracks?: CheckboxValueType[];
	address?: string;
	isDelegate?: boolean;
	balance?: BN;
	trackNum?: number;
	conviction?: number;
	title?: string;
	vote?: EVoteDecisionType;
	votedAt?: string;
	ayeVoteValue?: BN;
	nayVoteValue?: BN;
	abstainVoteValue?: BN;
	isMultisig?: boolean;
	redirect?: boolean;
	isVote?: boolean;
}

const DelegationSuccessPopup = ({
	className,
	open,
	setOpen,
	tracks,
	address,
	isDelegate,
	balance,
	conviction,
	title = 'Delegated',
	vote,
	votedAt,
	ayeVoteValue,
	nayVoteValue,
	abstainVoteValue,
	isMultisig,
	redirect = false,
	isVote
}: Props) => {
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
	const { network } = useNetworkContext();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const router = useRouter();
	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

<<<<<<< HEAD
	return <Modal
		zIndex={100000}
		open={open}
		className={`${theme === 'dark'? '[&>.ant-modal-content]:bg-section-dark-overlay' : ''} ${poppins.variable} ${poppins.className} ${isDelegate ? 'delegate' : 'undelegate'}`}
		wrapClassName={`${className} dark:bg-modalOverlayDark`}
		closeIcon={isDelegate ? <CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' /> : <UndelegateCloseIcon/>}
		onCancel={() => { !isVote && router.reload() ; setOpen(false); }}
		centered
		footer={false}
		maskClosable={false}
	>
		<div className='flex justify-center items-center flex-col -mt-[132px]'>
			{isMultisig ? <MultisigSuccessIcon/> :<SuccessIcon/>}
			<h2 className='text-[20px] font-semibold tracking-[0.0015em] mt-4'>{title ? title : isDelegate ? isMultisig ? `${title}`: `${title} successfully` : isMultisig ? `${title}`: 'Undelegated successfully' }</h2>
			{isDelegate && <div className='flex flex-col justify-center items-center gap-[14px]'>
				{balance && <div className='text-pink_primary text-[24px] font-semibold'>{formatedBalance(balance.toString(), unit)}{` ${unit}`}</div>}
				{
					vote === EVoteDecisionType.SPLIT && <div className=' flex flex-wrap justify-center font-normal text-sm text-blue-light-high dark:text-blue-dark-high'> <span className='mr-3'><span className='font-semibold'> Aye: </span><span className='font-normal'>{ayeVoteValue ? formatedBalance(ayeVoteValue.toString(), unit) : 0}{` ${unit}`}</span></span> <span className='mr-3'><span className='font-semibold'>Nay: </span><span className='font-normal'>{nayVoteValue ? formatedBalance(nayVoteValue.toString(), unit)  : 0}{` ${unit}`}</span></span></div>
				}
				{
					vote === EVoteDecisionType.ABSTAIN &&  <div className='flex flex-wrap justify-center font-normal text-sm text-blue-light-high dark:text-blue-dark-high'> <span className='mr-3'><span className='font-semibold'> Abstain:</span> <span className='font-normal'>{abstainVoteValue ? formatedBalance(abstainVoteValue.toString(), unit) : 0}{` ${unit}`}</span></span> <span className='mr-3'> <span className='font-semibold'>Aye:</span> <span className='font-normal'> {ayeVoteValue ? formatedBalance(ayeVoteValue.toString(), unit) : 0}{` ${unit}`}</span></span> <span className='mr-3'><span className='font-semibold'>Nay:</span> <span className='font-normal'>{nayVoteValue ? formatedBalance(nayVoteValue.toString(), unit)  : 0}{` ${unit}`}</span></span></div>
				}
				<div className='flex-col flex items-start justify-center gap-[10px]'>
					{address && <div className='flex gap-3 text-sm text-bodyBlue font-normal'>{isVote ? 'With' : 'To'} {isMultisig ? ' multisig': 'address'}:<span className='font-medium'>
						<Address address={address}
							truncateUsername={false}
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
=======
	return (
		<Modal
			zIndex={100000}
			open={open}
			className={`${poppins.variable} ${poppins.className} ${isDelegate ? 'delegate' : 'undelegate'}`}
			wrapClassName={className}
			closeIcon={isDelegate ? <CloseIcon /> : <UndelegateCloseIcon />}
			onCancel={() => {
				redirect && router.reload();
				setOpen(false);
			}}
			centered
			footer={false}
			maskClosable={false}
		>
			<div className='-mt-[132px] flex flex-col items-center justify-center'>
				{isMultisig ? <MultisigSuccessIcon /> : <SuccessIcon />}
				<h2 className='mt-4 text-[20px] font-semibold tracking-[0.0015em]'>
					{title ? title : isDelegate ? (isMultisig ? `${title}` : `${title} successfully`) : isMultisig ? `${title}` : 'Undelegated successfully'}
				</h2>
				{isDelegate && (
					<div className='flex flex-col items-center justify-center gap-[14px]'>
						{balance && (
							<div className='text-[24px] font-semibold text-pink_primary'>
								{formatedBalance(balance.toString(), unit)}
								{` ${unit}`}
							</div>
						)}
						{vote === EVoteDecisionType.SPLIT && (
							<div className=' flex flex-wrap justify-center text-sm font-normal text-bodyBlue'>
								{' '}
								<span className='mr-3'>
									<span className='font-semibold'> Aye: </span>
									<span className='font-normal'>
										{ayeVoteValue ? formatedBalance(ayeVoteValue.toString(), unit) : 0}
										{` ${unit}`}
									</span>
								</span>{' '}
								<span className='mr-3'>
									<span className='font-semibold'>Nay: </span>
									<span className='font-normal'>
										{nayVoteValue ? formatedBalance(nayVoteValue.toString(), unit) : 0}
										{` ${unit}`}
									</span>
								</span>
							</div>
						)}
						{vote === EVoteDecisionType.ABSTAIN && (
							<div className='flex flex-wrap justify-center text-sm font-normal text-bodyBlue'>
								{' '}
								<span className='mr-3'>
									<span className='font-semibold'> Abstain:</span>{' '}
									<span className='font-normal'>
										{abstainVoteValue ? formatedBalance(abstainVoteValue.toString(), unit) : 0}
										{` ${unit}`}
									</span>
								</span>{' '}
								<span className='mr-3'>
									{' '}
									<span className='font-semibold'>Aye:</span>{' '}
									<span className='font-normal'>
										{' '}
										{ayeVoteValue ? formatedBalance(ayeVoteValue.toString(), unit) : 0}
										{` ${unit}`}
									</span>
								</span>{' '}
								<span className='mr-3'>
									<span className='font-semibold'>Nay:</span>{' '}
									<span className='font-normal'>
										{nayVoteValue ? formatedBalance(nayVoteValue.toString(), unit) : 0}
										{` ${unit}`}
									</span>
								</span>
							</div>
						)}
						<div className='flex flex-col items-start justify-center gap-[10px]'>
							{address && (
								<div className='flex gap-3 text-sm font-normal text-bodyBlue'>
									{isVote ? 'With' : 'To'} {isMultisig ? ' multisig' : 'address'}:
									<span className='font-medium'>
										<Address
											address={address}
											isTruncateUsername={false}
											className='address'
											displayInline={true}
										/>
									</span>
								</div>
							)}
							{vote && (
								<div className='flex h-[21px] gap-[70px] text-sm font-normal text-bodyBlue'>
									Vote :
									{vote === EVoteDecisionType.AYE ? (
										<p>
											<LikeFilled className='text-[green]' /> <span className='font-medium capitalize text-bodyBlue'>{vote}</span>
										</p>
									) : vote === EVoteDecisionType.NAY ? (
										<div>
											<DislikeFilled className='text-[red]' /> <span className='mb-[5px] font-medium capitalize text-bodyBlue'>{vote}</span>
										</div>
									) : vote === EVoteDecisionType.SPLIT ? (
										<p>
											<SplitYellow /> <span className='font-medium capitalize text-bodyBlue'>{vote}</span>
										</p>
									) : vote === EVoteDecisionType.ABSTAIN ? (
										<p className='flex align-middle'>
											<AbstainGray className='mr-1' /> <span className='font-medium capitalize text-bodyBlue'>{vote}</span>
										</p>
									) : null}
								</div>
							)}
							<div className='flex gap-[30px] text-sm font-normal text-bodyBlue'>
								Conviction:<span className='font-medium text-bodyBlue'>{conviction === 0 ? 0.1 : 0}x</span>{' '}
							</div>
							{isMultisig && (
								<div className='flex h-[21px] gap-[35px] text-sm font-normal text-lightBlue'>
									Vote Link:{' '}
									<span className='font-medium text-bodyBlue'>
										<a
											className='text-pink_primary'
											href='https://app.polkasafe.xyz/transactions'
											target='_blank'
											rel='noreferrer'
										>
											Polkasafe
										</a>
									</span>
								</div>
							)}
							{tracks && (
								<div className='flex gap-[35px] text-sm text-bodyBlue'>
									Track(s):
									<span>
										<div className={`flex max-h-[100px] min-h-[50px] flex-col gap-1 pr-2 font-medium text-bodyBlue ${tracks.length > 4 && 'overflow-y-scroll'}`}>
											{tracks.map((track, index) => (
												<div key={index}>
													{track} #{networkTrackInfo[network][track.toString()].trackId}
												</div>
											))}
										</div>
									</span>
								</div>
							)}
							{votedAt && (
								<div className='flex h-[21px] gap-[14px] text-sm font-normal text-bodyBlue'>
									Time of Vote : <span className='font-medium text-bodyBlue'>{votedAt}</span>
								</div>
							)}
						</div>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
					</div>
				)}
			</div>
		</Modal>
	);
};

export default DelegationSuccessPopup;
