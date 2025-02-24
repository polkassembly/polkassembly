// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { LikeFilled } from '@ant-design/icons';
// import { DislikeFilled, LikeFilled } from '@ant-design/icons';
import CloseIcon from '~assets/icons/close-cross-icon.svg';
import { Divider } from 'antd';
import Loader from '~src/ui-components/Loader';
import { parseBalance } from './utils/parseBalaceToReadable';
import dayjs from 'dayjs';
import { useNetworkSelector, useVoteDataSelector } from '~src/redux/selectors';
import DelegationListRow from './DelegationListRow';
import { network as AllNetworks } from '~src/global/networkConstants';
import Address from '~src/ui-components/Address';
import { VoteType } from '~src/global/proposalType';
import { useDispatch } from 'react-redux';
import { setClearInitialState, setIsVoteDataModalClose } from '~src/redux/voteData';
import SkeletonButton from '~src/basic-components/Skeleton/SkeletonButton';
import { CalenderIcon, CapitalIcon, ConvictionIcon, EmailIconNew, PowerIcon, VoterIcon } from '~src/ui-components/CustomIcons';

const getPercentage = (userVotes: string, totalVotes: string) => {
	if (!totalVotes) {
		return;
	}
	if (isNaN(Number(userVotes[userVotes.length - 1]))) {
		userVotes = userVotes.substring(0, userVotes.length - 1);
	}
	if (isNaN(Number(totalVotes[totalVotes.length - 1]))) {
		totalVotes = totalVotes.substring(0, totalVotes.length - 1);
	}
	const percentage = Number(((Number(userVotes) / Number(totalVotes)) * 100).toFixed(2));
	if (percentage < 1) {
		return ' <1';
	}

	return percentage;
};

const VoteDataExpand = () => {
	const { network } = useNetworkSelector();
	const { voteData, isReferendum2, delegatedData, tally, delegatorLoading, voteType, setDelegationVoteModal } = useVoteDataSelector();
	const dispatch = useDispatch();

	return (
		<main className='dark:bg-section-dark-overlay'>
			<div className='mx-auto mt-2 flex h-1 w-[56px] rounded-[100px] bg-section-light-container'></div>
			<div className='flex items-center justify-between px-4 pt-3 dark:bg-section-dark-overlay '>
				<div className='flex space-x-[6px]'>
					<LikeFilled />
					<span className='text-lg font-semibold text-blue-light-high dark:text-white'>
						Voted <span>{voteData?.decision === 'yes' ? 'Aye' : 'Nays'}</span>
					</span>
				</div>
				<span
					onClick={() => {
						dispatch(setIsVoteDataModalClose());
						dispatch(setClearInitialState());
					}}
				>
					<CloseIcon />
				</span>
			</div>
			<Divider />
			<div className='flex justify-between px-4 pb-3 dark:bg-section-dark-overlay'>
				<div className=''>
					<span className='text-sm font-medium text-blue-light-medium dark:text-blue-dark-medium'>Voter</span>
					<div>
						{voteType === VoteType.REFERENDUM_V2 && voteData?.txnHash ? (
							<a
								href={`https://${network}.moonscan.io/tx/${voteData?.txnHash}`}
								className={`w-[190px] overflow-ellipsis ${voteData?.decision === 'abstain' ? 'w-[220px]' : ''}`}
							>
								<Address
									isVoterAddress
									usernameClassName='w-[250px]'
									isSubVisible={false}
									displayInline
									showFullAddress
									address={voteData?.voter}
								/>
							</a>
						) : (
							<div
								className={`w-[190px] overflow-ellipsis ${voteData?.decision === 'abstain' ? 'w-[220px]' : ''}`}
								onClick={(e) => e.stopPropagation()}
							>
								<Address
									usernameClassName='overflow-ellipsis sm:w-[250px] '
									isSubVisible={false}
									displayInline
									showFullAddress
									address={voteData?.voter}
								/>
							</div>
						)}
					</div>
				</div>
				<div className='flex flex-col'>
					<span className='text-sm font-medium text-blue-light-medium dark:text-blue-dark-medium'>Voting Power</span>
					<span className='text-sm font-normal tracking-tighter'>
						{parseBalance(
							voteData && voteData.decision !== 'abstain'
								? (voteData.totalVotingPower || voteData.votingPower)?.toString() ?? '0'
								: (BigInt(voteData?.balance?.abstain || 0) / BigInt(10))?.toString() ?? '0',
							2,
							true,
							network
						)}
					</span>
				</div>
			</div>
			<div className='flex flex-col gap-4 px-4 dark:bg-section-dark-overlay'>
				<div className='flex items-center justify-between gap-[50px] border-x-0 border-y-2 border-dashed border-section-light-container py-4 dark:border-[#3B444F] dark:border-separatorDark'>
					<span className='flex items-center gap-1 text-xs text-bodyBlue dark:text-blue-dark-high'>
						<CalenderIcon className='text-lightBlue dark:text-blue-dark-medium' />
						{dayjs(voteData?.createdAt)
							.format('MM/DD/YYYY, h:mm A')
							.toString()}
					</span>
					{voteData?.decision !== 'abstain' && isReferendum2 && (
						<span className='flex items-center gap-1 text-xs font-medium text-lightBlue dark:text-blue-dark-medium'>
							<PowerIcon className='text-lightBlue dark:text-blue-dark-medium' />
							Voting Power:{' '}
							<span className='text-bodyBlue dark:text-blue-dark-high'>
								{getPercentage(voteData?.totalVotingPower || (voteData?.decision === 'abstain' ? voteData?.balance?.abstain || 0 : voteData?.balance?.value) || 0, tally)}%
							</span>
						</span>
					)}
				</div>
				<div>
					<p className='mb-2.5 px-1 text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>Vote Breakdown</p>
					<div className=''>
						<div className='flex flex-col gap-1 border-x-0 border-t-0 border-dashed border-section-light-container px-1 pb-2 dark:border-[#3B444F] dark:border-separatorDark'>
							<div className='text-xs font-medium text-lightBlue dark:text-blue-dark-medium'>Self Votes</div>
							<div className='flex justify-between'>
								<span className='flex items-center gap-1 text-xs text-[#576D8B] dark:text-blue-dark-high'>
									<VoterIcon className='text-lightBlue dark:text-blue-dark-medium' /> Voting Power
								</span>
								<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>{parseBalance((voteData?.selfVotingPower || 0).toString(), 2, true, network)}</span>
							</div>
							<div className='flex justify-between'>
								<span className='flex items-center gap-1 text-xs text-[#576D8B] dark:text-blue-dark-high'>
									<ConvictionIcon className='text-lightBlue dark:text-blue-dark-medium' />
									Conviction
								</span>
								<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>
									{voteData?.lockPeriod ? `${voteData?.lockPeriod}x${voteData?.delegatedVotes?.length > 0 ? '/d' : ''}` : '0.1x'}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='flex items-center gap-1 text-xs text-[#576D8B] dark:text-blue-dark-high'>
									<CapitalIcon className='text-lightBlue dark:text-blue-dark-medium' /> Capital
								</span>
								<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>
									{parseBalance((voteData?.decision === 'abstain' ? voteData?.balance?.abstain || 0 : voteData?.balance?.value || 0).toString(), 2, true, network)}
								</span>
							</div>
						</div>

						{voteData?.delegatedVotes?.length > 0 && (
							<>
								<div className='border-y-0 border-l-2 border-r-0 border-dashed border-section-light-container dark:border-[#3B444F] dark:border-separatorDark max-sm:hidden'></div>
								<div className='mt-2.5 flex-col gap-1 px-1 sm:mt-0'>
									<div className='text-xs font-medium text-lightBlue dark:text-blue-dark-medium'>Delegated Votes</div>
									<div className='mt-1.5 flex justify-between'>
										<span className='flex items-center gap-1 text-xs text-[#576D8B] dark:text-blue-dark-high'>
											<VoterIcon className='text-lightBlue dark:text-blue-dark-medium' /> Voting Power
										</span>
										<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>{parseBalance((voteData?.delegatedVotingPower || '0').toString(), 2, true, network)}</span>
									</div>
									<div className='flex justify-between'>
										<span className='flex items-center gap-1 text-xs text-[#576D8B] dark:text-blue-dark-high'>
											<EmailIconNew className='text-lightBlue dark:text-blue-dark-medium' /> Delegators
										</span>
										<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>{delegatorLoading ? <Loader size='small' /> : delegatedData?.delegator}</span>
									</div>
									<div className='flex justify-between'>
										<span className='flex items-center gap-1 text-xs text-[#576D8B] dark:text-blue-dark-high'>
											<CapitalIcon className='text-lightBlue dark:text-blue-dark-medium' /> Capital
										</span>
										<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>
											{delegatorLoading ? <Loader size='small' /> : parseBalance((delegatedData?.delegatedVotesCapital || '0').toString(), 2, true, network)}
										</span>
									</div>
								</div>
							</>
						)}
					</div>
				</div>
				{voteData?.delegatedVotes?.length > 0 && (
					<>
						<Divider
							dashed
							className='m-0 mt-2 border-[2px] border-x-0 border-b-0 border-section-light-container dark:border-[#3B444F] dark:border-separatorDark'
						/>
						<div>
							<p className='mb-4 px-1 text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>Delegation list</p>
							<div className='mb-2 flex items-start text-xs font-semibold'>
								<div className='w-[200px] text-lightBlue dark:text-blue-dark-medium'>Delegators</div>
								<div className='w-[110px] items-center text-lightBlue dark:text-blue-dark-medium'>Amount</div>
								{network !== AllNetworks.COLLECTIVES ? <div className='ml-1 w-[110px] items-center text-lightBlue dark:text-blue-dark-medium'>Conviction</div> : null}
								<div className='w-[100px] items-center text-lightBlue dark:text-blue-dark-medium'>Voting Power</div>
							</div>
							<div className='flex max-h-[70px] flex-col gap-1 overflow-y-auto pr-2'>
								{voteData?.delegatedVotes?.map((data: any, i: number) => (
									<DelegationListRow
										key={i}
										voteType={voteType}
										voteData={data}
									/>
								))}
							</div>
							{delegatorLoading ? (
								<SkeletonButton active />
							) : (
								delegatedData?.delegator > 10 && (
									<p
										className='m-0 mt-2 cursor-pointer text-xs font-medium text-pink_primary'
										onClick={() => setDelegationVoteModal({ isOpen: true, voter: voteData?.voter })}
									>
										Show More
									</p>
								)
							)}
						</div>
					</>
				)}
			</div>
		</main>
	);
};

export default VoteDataExpand;
