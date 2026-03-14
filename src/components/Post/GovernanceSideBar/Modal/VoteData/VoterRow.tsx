// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useState, useEffect } from 'react';
import Address from 'src/ui-components/Address';
import { VoteType } from '~src/global/proposalType';
import { network as AllNetworks } from '~src/global/networkConstants';
import { Collapse } from '~src/components/Settings/Notifications/common-ui/Collapse';
import CollapseDownIcon from '~assets/icons/keyboard_arrow_down.svg';
import CollapseUpIcon from '~assets/icons/keyboard_arrow_up.svg';
import styled from 'styled-components';
import { Divider, Tooltip } from 'antd';
import DelegationListRow from './DelegationListRow';
import dayjs from 'dayjs';
import { parseBalance } from './utils/parseBalaceToReadable';
import Loader from '~src/ui-components/Loader';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useNetworkSelector, useVoteDataSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { DislikeFilled, LikeFilled } from '@ant-design/icons';
import AbstainGray from '~assets/icons/abstainGray.svg';
import { useDispatch } from 'react-redux';
import {
	setIsReferendum2,
	setIsVoteDataModalOpen,
	setSetDelegatedData,
	setSetDelegationVoteModal,
	setTally,
	setVoteData,
	setVoteType,
	setDelegatorLoadingFalse,
	setDelegatorLoadingTrue
} from '~src/redux/voteData';
import SkeletonButton from '~src/basic-components/Skeleton/SkeletonButton';
import { usePostDataContext } from '~src/context';
import { CalenderIcon, CapitalIcon, ConvictionIcon, EmailIconNew, PowerIcon, VoterIcon } from '~src/ui-components/CustomIcons';

interface IVoterRow {
	className?: string;
	index?: any;
	voteType: VoteType;
	voteData?: any;
	isReferendum2?: boolean;
	setDelegationVoteModal: any;
	currentKey?: any;
	setActiveKey?: any;
	tally?: any;
	referendumId?: any;
	decision?: any;
	isUsedInVotedModal?: boolean;
}

const StyledCollapse = styled(Collapse)`
	background-color: ${(props: any) => (props.theme == 'dark' ? '#0D0D0D' : '')} !important;
	.ant-collapse-item {
		border-bottom: none;
	}
	.ant-collapse-header {
		border: none !important;
		padding: 16px 8px !important;
	}
	.ant-collapse-content {
		border-top: none !important;
	}
	.ant-collapse-content-box {
		padding: 0px 8px !important;
		padding-bottom: 16px !important;
	}
	.ant-collapse-expand-icon {
		padding: 0px !important;
		margin-left: -16px !important;
	}
	@media (max-width: 768px) {
		&.ant-collapse-large > .ant-collapse-item > .ant-collapse-header {
			padding: 16px 8px !important;
		}
	}
`;

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

const VoterRow: FC<IVoterRow> = ({
	currentKey,
	setActiveKey,
	voteType,
	voteData,
	className,
	setDelegationVoteModal,
	index,
	tally,
	referendumId,
	isUsedInVotedModal,
	decision,
	isReferendum2
}) => {
	const {
		postData: { postIndex }
	} = usePostDataContext();
	const [active, setActive] = useState<boolean | undefined>(false);
	const { network } = useNetworkSelector();
	// const [delegatorLoading, setDelegatorLoading] = useState<boolean>(true);
	const { delegatorLoading } = useVoteDataSelector();
	const [delegatedData, setDelegatedData] = useState<any>(null);
	const [voteDecision, setVoteDecision] = useState('');
	const { resolvedTheme: theme } = useTheme();
	const dispatch = useDispatch();
	const isSmallScreen = window.innerWidth < 640;

	useEffect(() => {
		// if (!active) {
		// return;
		// }
		if (delegatedData === null) {
			(async () => {
				dispatch(setDelegatorLoadingTrue());
				const url = `api/v1/votes/delegationVoteCountAndPower?postId=${referendumId || postIndex}&decision=${decision || 'yes'}&type=${voteType}&voter=${voteData.voter}`;
				const { data, error } = await nextApiClientFetch<any>(url);

				if (error) {
					console.log('Error in fetching delegated Data');
				}
				if (data) {
					const payload = {
						delegatedVotesCapital: data.voteCapital,
						delegator: data.count
					};
					setDelegatedData(payload);
				}
				dispatch(setDelegatorLoadingFalse());
			})();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [active, decision, delegatedData, referendumId, voteData.voter, voteType]);

	useEffect(() => {
		if (voteData.decision === 'yes') {
			setVoteDecision('Aye');
		} else if (voteData.decision === 'no') {
			setVoteDecision('Nay');
		} else {
			setVoteDecision('Abstain');
		}
	}, [voteData.decision]);

	const Title = () => (
		<div className='m-0 p-0'>
			<div className='m-0 flex w-full items-center'>
				{!isUsedInVotedModal ? (
					<div>
						{voteType === VoteType.REFERENDUM_V2 && voteData?.txnHash ? (
							<a
								href={`https://${network}.moonscan.io/tx/${voteData?.txnHash}`}
								className={`w-[160px] overflow-ellipsis sm:w-[190px] ${voteData?.decision === 'abstain' ? 'sm:w-[220px]' : ''}`}
							>
								<Address
									isVoterAddress
									usernameClassName=' sm:w-[250px]'
									isSubVisible={false}
									displayInline
									showFullAddress
									showProxyTitle={false}
									address={voteData?.voter}
								/>
							</a>
						) : (
							<div
								className={`w-[160px] overflow-ellipsis sm:w-[190px] ${voteData?.decision === 'abstain' ? 'sm:w-[220px]' : ''}`}
								onClick={(e) => e.stopPropagation()}
							>
								<Address
									usernameClassName='overflow-ellipsis sm:w-[250px]'
									isSubVisible={false}
									displayInline
									showFullAddress
									showProxyTitle={false}
									address={voteData?.voter}
								/>
							</div>
						)}
					</div>
				) : (
					<div className={`${isUsedInVotedModal ? '-ml-1' : ''} w-[160px] overflow-ellipsis sm:w-[190px] ${voteData?.decision === 'abstain' ? 'sm:w-[220px]' : ''}`}>
						{voteDecision === 'Nay' && (
							<div className='flex gap-x-2'>
								<DislikeFilled className='text-[red]' />
								<p className='m-0 p-0 font-medium capitalize text-[red]'>{voteDecision}</p>
							</div>
						)}
						{voteDecision === 'Aye' && (
							<div className='flex gap-x-2'>
								<LikeFilled className='text-[green]' />
								<p className='m-0 p-0 font-medium capitalize text-[green]'>{voteDecision}</p>
							</div>
						)}
						{voteDecision === 'Abstain' && (
							<div className='flex gap-x-2'>
								<AbstainGray className='mr-1' />
								<p className='font-medium capitalize text-bodyBlue dark:text-blue-dark-high'>{voteDecision}</p>
							</div>
						)}
					</div>
				)}

				{network !== AllNetworks.COLLECTIVES ? (
					<>
						<div
							className={`${isUsedInVotedModal && voteData?.decision === 'abstain' ? '-ml-7' : ''} w-[120px] overflow-ellipsis ${
								voteData?.decision === 'abstain' ? 'w-[160px]' : ''
							} hidden text-bodyBlue dark:text-blue-dark-high sm:flex`}
						>
							{parseBalance((voteData?.decision === 'abstain' ? voteData?.balance?.abstain || 0 : voteData?.balance?.value || 0).toString(), 2, true, network)}
						</div>
						{voteData?.decision !== 'abstain' && (
							<div
								className={`${
									isUsedInVotedModal && voteData?.decision !== 'abstain' ? 'ml-3' : ''
								} hidden w-[105px] overflow-ellipsis text-bodyBlue dark:text-blue-dark-high sm:flex`}
							>
								{voteData.lockPeriod === 0 ? '0.1' : voteData?.lockPeriod === null ? '' : voteData.lockPeriod}
								{voteData?.lockPeriod != null ? 'x' : ''}
								{voteData?.lockPeriod === null ? (
									<Tooltip
										color='#363636'
										title={<p className='m-0 whitespace-nowrap p-0 text-xs font-normal text-white'>Split Abstain</p>}
									>
										sa
									</Tooltip>
								) : voteData?.delegatedVotes?.length > 0 ? (
									'/d'
								) : (
									''
								)}
							</div>
						)}
					</>
				) : (
					<div className={'w-[120px] overflow-ellipsis text-bodyBlue dark:text-blue-dark-high'}>
						{parseBalance((voteData?.decision === 'abstain' ? voteData?.balance?.abstain || 0 : voteData?.balance?.value || 0).toString(), 2, true, network)}
					</div>
				)}

				{(voteData.totalVotingPower || voteData.votingPower) && (
					<div
						className={`${
							isUsedInVotedModal && voteData?.decision === 'abstain' ? 'sm:ml-[72px]' : ''
						} mr-4 w-full overflow-ellipsis text-bodyBlue dark:text-blue-dark-high sm:mr-0 sm:w-[90px]`}
						onClick={(e) => {
							e.stopPropagation();
						}}
					>
						{parseBalance(
							voteData?.decision !== 'abstain'
								? voteData.lockPeriod == null
									? voteData?.balance?.value
									: (voteData.totalVotingPower || voteData.votingPower).toString()
								: (BigInt(voteData?.balance?.abstain || 0) / BigInt(10)).toString(),
							2,
							true,
							network
						)}
						{isSmallScreen && voteData?.delegatedVotes?.length > 0 ? ' /d' : ''}
					</div>
				)}
			</div>
		</div>
	);

	return voteData?.decision !== 'abstain' && voteData?.lockPeriod !== null ? (
		<StyledCollapse
			className={`${
				active && !isSmallScreen ? 'border-t-2 border-pink_primary' : 'border-t-[1px] border-section-light-container dark:border-[#3B444F] dark:border-separatorDark'
			} w-full gap-[0px]  rounded-none border-0 sm:w-[550px] ${className}`}
			size='large'
			expandIconPosition='end'
			expandIcon={({ isActive }: { isActive?: boolean }) => {
				setActive(isActive);
				return isSmallScreen ? (
					<span
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							dispatch(setSetDelegatedData(delegatedData));
							dispatch(setIsReferendum2(isReferendum2));
							dispatch(setSetDelegationVoteModal(setDelegationVoteModal));
							dispatch(setTally(tally));
							dispatch(setVoteData(voteData));
							dispatch(setVoteType(voteType as any));
							dispatch(setIsVoteDataModalOpen());
						}}
					>
						<CollapseDownIcon />
					</span>
				) : isActive ? (
					<CollapseUpIcon />
				) : (
					<CollapseDownIcon />
				);
			}}
			activeKey={currentKey === index ? 1 : 0}
			onChange={() => setActiveKey?.(currentKey === index ? null : index)}
			theme={theme as any}
			// isSmallScreen={isSmallScreen}
			items={[
				{
					children: (
						<>
							{!isSmallScreen && (
								<div className='flex flex-col gap-4 dark:bg-section-dark-overlay'>
									<div className='flex items-center gap-[60px] border-x-0 border-y-2 border-dashed border-section-light-container py-4 dark:border-[#3B444F] dark:border-separatorDark'>
										<span className='flex items-center gap-1 text-xs text-bodyBlue dark:text-blue-dark-high'>
											<CalenderIcon className='text-blue-light-medium dark:text-blue-dark-medium' /> {dayjs(voteData.createdAt).format('MM/DD/YYYY, h:mm A').toString()}
										</span>
										{voteData?.decision !== 'abstain' && isReferendum2 && (
											<span className='flex items-center gap-1 text-xs font-medium text-lightBlue dark:text-blue-dark-medium'>
												<PowerIcon className='text-blue-light-mediume dark:text-blue-dark-medium' />
												Voting Power:{' '}
												<span className='text-bodyBlue dark:text-blue-dark-high'>
													{getPercentage(voteData?.totalVotingPower || (voteData?.decision === 'abstain' ? voteData?.balance?.abstain || 0 : voteData?.balance?.value) || 0, tally)}
													%
												</span>
											</span>
										)}
									</div>
									<div>
										<p className='mb-4 text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>Vote Breakdown</p>
										<div className='flex justify-between'>
											<div className='flex w-[200px] flex-col gap-1'>
												<div className='text-xs font-medium text-lightBlue dark:text-blue-dark-medium'>Self Votes</div>
												<div className='flex justify-between'>
													<span className='flex items-center gap-1 text-xs text-blue-light-helper dark:text-blue-dark-medium'>
														<VoterIcon className='text-blue-light-medium dark:text-blue-dark-medium' /> Voting Power
													</span>
													<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>{parseBalance((voteData.selfVotingPower || 0).toString(), 2, true, network)}</span>
												</div>
												<div className='flex justify-between'>
													<span className='flex items-center gap-1 text-xs text-blue-light-helper dark:text-blue-dark-medium'>
														<ConvictionIcon className='text-blue-light-medium dark:text-blue-dark-medium' /> Conviction
													</span>
													<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>
														{voteData.lockPeriod ? `${voteData.lockPeriod}x${voteData?.delegatedVotes?.length > 0 ? '/d' : ''}` : '0.1x'}
													</span>
												</div>
												<div className='flex justify-between'>
													<span className='flex items-center gap-1 text-xs text-blue-light-helper dark:text-blue-dark-medium'>
														<CapitalIcon className='text-blue-light-medium dark:text-blue-dark-medium' /> Capital
													</span>
													<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>
														{parseBalance((voteData?.decision === 'abstain' ? voteData?.balance?.abstain || 0 : voteData?.balance?.value || 0).toString(), 2, true, network)}
													</span>
												</div>
											</div>
											{voteData?.delegatedVotes?.length > 0 && (
												<>
													<div className='border-y-0 border-l-2 border-r-0 border-dashed border-section-light-container dark:border-[#3B444F] dark:border-separatorDark'></div>
													<div className='mr-3 flex w-[200px] flex-col gap-1'>
														<div className='text-xs font-medium text-lightBlue dark:text-blue-dark-medium'>Delegated Votes</div>
														<div className='flex justify-between'>
															<span className='flex items-center gap-1 text-xs text-blue-light-helper dark:text-blue-dark-medium'>
																<VoterIcon className='text-blue-light-medium dark:text-blue-dark-medium' /> Voting Power
															</span>
															<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>
																{parseBalance((voteData?.delegatedVotingPower || '0').toString(), 2, true, network)}
															</span>
														</div>
														<div className='flex justify-between'>
															<span className='flex items-center gap-1 text-xs text-blue-light-helper dark:text-blue-dark-medium'>
																<EmailIconNew className='text-blue-light-medium dark:text-blue-dark-medium' /> Delegators
															</span>
															<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>{delegatorLoading ? <Loader size='small' /> : delegatedData?.delegator}</span>
														</div>
														<div className='flex justify-between'>
															<span className='flex items-center gap-1 text-xs text-blue-light-helper dark:text-blue-dark-medium'>
																<CapitalIcon className='text-blue-light-medium dark:text-blue-dark-medium' /> Capital
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
												<p className='mb-4 text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>Delegation list</p>
												<div className='mb-2 flex items-center text-xs font-semibold'>
													<div className='w-[200px] text-lightBlue dark:text-blue-dark-medium'>Delegators</div>
													<div className='w-[110px] items-center text-lightBlue dark:text-blue-dark-medium'>Amount</div>
													{network !== AllNetworks.COLLECTIVES ? <div className='ml-1 w-[110px] items-center text-lightBlue dark:text-blue-dark-medium'>Conviction</div> : null}
													<div className='w-[100px] items-center text-lightBlue dark:text-blue-dark-medium'>Voting Power</div>
												</div>
												<div className='flex max-h-[70px] flex-col gap-1 overflow-y-auto pr-2'>
													{voteData?.delegatedVotes.map((data: any, i: number) => (
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
															onClick={() => setDelegationVoteModal({ isOpen: true, voter: voteData.voter })}
														>
															Show More
														</p>
													)
												)}
											</div>
										</>
									)}
								</div>
							)}
						</>
					),
					className: `rounded-none p-0 ${
						active && !isSmallScreen ? 'border-x-0 border-y-0 border-b-2 border-solid  border-pink_primary' : ''
					} gap-[0px] text-bodyBlue dark:text-blue-dark-high dark:[&>.ant-collapse-content]:bg-section-dark-overlay`,
					key: 1,
					label: <Title />
				}
			]}
		/>
	) : (
		<div
			className={`w-full border-x-0 border-y-0 border-t border-solid border-section-light-container px-[10px] py-4 text-sm text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high sm:w-[550px] ${
				isUsedInVotedModal ? '' : `${className}`
			}`}
		>
			<Title />
		</div>
	);
};

export default React.memo(VoterRow);
