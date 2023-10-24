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
import CalenderIcon from '~assets/icons/calender-icon.svg';
import PowerIcon from '~assets/icons/body-part-muscle.svg';
import VoterIcon from '~assets/icons/vote-small-icon.svg';
import ConvictionIcon from '~assets/icons/conviction-small-icon.svg';
import CapitalIcon from '~assets/icons/capital-small-icom.svg';
import EmailIcon from '~assets/icons/email_icon.svg';
import styled from 'styled-components';
import { Divider, Skeleton } from 'antd';
import DelegationListRow from './DelegationListRow';
import dayjs from 'dayjs';
import { parseBalance } from './utils/parseBalaceToReadable';
import Loader from '~src/ui-components/Loader';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useNetworkSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';

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
}

const StyledCollapse = styled(Collapse)`
	background-color: ${(props) => (props.theme == 'dark' ? '#0D0D0D' : '')} !important;
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

const VoterRow: FC<IVoterRow> = ({ currentKey, setActiveKey, voteType, voteData, className, setDelegationVoteModal, index, tally, referendumId, decision, isReferendum2 }) => {
	const [active, setActive] = useState<boolean | undefined>(false);
	const { network } = useNetworkSelector();
	const [delegatorLoading, setDelegatorLoading] = useState(true);
	const [delegatedData, setDelegatedData] = useState<any>(null);
	const { resolvedTheme: theme } = useTheme();
	useEffect(() => {
		if (!active) {
			return;
		}
		if (delegatedData === null) {
			(async () => {
				const url = `api/v1/votes/delegationVoteCountAndPower?postId=${referendumId}&decision=${decision || 'yes'}&type=${voteType}&voter=${voteData.voter}`;
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
				setDelegatorLoading(false);
			})();
		}
	}, [active, decision, delegatedData, referendumId, voteData.voter, voteType]);

	const Title = () => (
		<div className='m-0 p-0'>
			<div className='m-0 flex w-full items-center'>
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
							usernameClassName='overflow-ellipsis w-[250px] '
							isSubVisible={false}
							displayInline
							showFullAddress
							address={voteData?.voter}
						/>
					</div>
				)}

				{network !== AllNetworks.COLLECTIVES ? (
					<>
						<div className={`w-[120px] overflow-ellipsis ${voteData?.decision === 'abstain' ? 'w-[160px]' : ''} text-bodyBlue dark:text-blue-dark-high`}>
							{parseBalance((voteData?.decision === 'abstain' ? voteData?.balance?.abstain || 0 : voteData?.balance?.value || 0).toString(), 2, true, network)}
						</div>
						{voteData?.decision !== 'abstain' && (
							<div className={'w-[105px] overflow-ellipsis text-bodyBlue dark:text-blue-dark-high'}>
								{`${voteData.lockPeriod === 0 ? '0.1' : voteData.lockPeriod}x${voteData?.delegatedVotes?.length > 0 ? '/d' : ''}`}
							</div>
						)}
					</>
				) : (
					<div className={'w-[120px] overflow-ellipsis text-bodyBlue dark:text-blue-dark-high'}>
						{parseBalance((voteData?.decision === 'abstain' ? voteData?.balance?.abstain || 0 : voteData?.balance?.value || 0).toString(), 2, true, network)}
					</div>
				)}

				{(voteData.totalVotingPower || voteData.votingPower) && (
					<div className='w-[90px] overflow-ellipsis text-bodyBlue dark:text-blue-dark-high'>
						{parseBalance(
							voteData?.decision !== 'abstain' ? (voteData.totalVotingPower || voteData.votingPower).toString() : (Number(voteData?.balance?.abstain) || 0) * 0.1,
							2,
							true,
							network
						)}
					</div>
				)}
			</div>
		</div>
	);
	return voteData?.delegatedVotes?.length > 0 && voteData?.decision !== 'abstain' ? (
		<StyledCollapse
			className={`${active ? 'border-t-2 border-pink_primary' : 'border-t-[1px] border-[#D2D8E0]'} w-[550px] gap-[0px] rounded-none border-0 ${className}`}
			size='large'
			expandIconPosition='end'
			expandIcon={({ isActive }) => {
				setActive(isActive);
				return isActive ? <CollapseUpIcon /> : <CollapseDownIcon />;
			}}
			activeKey={currentKey === index ? 1 : 0}
			onChange={() => setActiveKey(currentKey === index ? null : index)}
			theme={theme}
		>
			<StyledCollapse.Panel
				className={`rounded-none p-0 ${
					active ? 'border-x-0 border-y-0 border-b-2 border-solid  border-pink_primary' : ''
				} gap-[0px] text-bodyBlue dark:text-blue-dark-high dark:[&>.ant-collapse-content]:bg-section-dark-overlay`}
				key={1}
				header={<Title />}
			>
				<div className='flex flex-col gap-4 dark:bg-section-dark-overlay'>
					<div className='flex items-center gap-[60px] border-x-0 border-y-2 border-dashed border-[#D2D8E0] py-4'>
						<span className='flex items-center gap-1 text-xs text-bodyBlue dark:text-blue-dark-high'>
							<CalenderIcon />{' '}
							{dayjs(voteData.createdAt.toDate?.())
								.format('MM/DD/YYYY, h:mm A')
								.toString()}
						</span>
						{voteData?.decision !== 'abstain' && isReferendum2 && (
							<span className='flex items-center gap-1 text-xs font-medium text-lightBlue dark:text-blue-dark-medium'>
								<PowerIcon />
								Voting Power:{' '}
								<span className='text-bodyBlue dark:text-blue-dark-high'>
									{getPercentage(voteData?.totalVotingPower || (voteData?.decision === 'abstain' ? voteData?.balance?.abstain || 0 : voteData?.balance?.value) || 0, tally)}%
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
									<span className='flex items-center gap-1 text-xs text-[#576D8B]'>
										<VoterIcon /> Voting Power
									</span>
									<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>{parseBalance((voteData.selfVotingPower || 0).toString(), 2, true, network)}</span>
								</div>
								<div className='flex justify-between'>
									<span className='flex items-center gap-1 text-xs text-[#576D8B]'>
										<ConvictionIcon /> Conviction
									</span>
									<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>
										{voteData.lockPeriod ? `${voteData.lockPeriod}x${voteData?.delegatedVotes?.length > 0 ? '/d' : ''}` : '0.1x'}
									</span>
								</div>
								<div className='flex justify-between'>
									<span className='flex items-center gap-1 text-xs text-[#576D8B]'>
										<CapitalIcon /> Capital
									</span>
									<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>
										{parseBalance((voteData?.decision === 'abstain' ? voteData?.balance?.abstain || 0 : voteData?.balance?.value || 0).toString(), 2, true, network)}
									</span>
								</div>
							</div>
							<div className='border-y-0 border-l-2 border-r-0 border-dashed border-[#D2D8E0]'></div>
							<div className='mr-3 flex w-[200px] flex-col gap-1'>
								<div className='text-xs font-medium text-lightBlue dark:text-blue-dark-medium'>Delegated Votes</div>
								<div className='flex justify-between'>
									<span className='flex items-center gap-1 text-xs text-[#576D8B]'>
										<VoterIcon /> Voting Power
									</span>
									<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>{parseBalance((voteData?.delegatedVotingPower || '0').toString(), 2, true, network)}</span>
								</div>
								<div className='flex justify-between'>
									<span className='flex items-center gap-1 text-xs text-[#576D8B]'>
										<EmailIcon /> Delegators
									</span>
									<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>{delegatorLoading ? <Loader size='small' /> : delegatedData?.delegator}</span>
								</div>
								<div className='flex justify-between'>
									<span className='flex items-center gap-1 text-xs text-[#576D8B]'>
										<CapitalIcon /> Capital
									</span>
									<span className='text-xs text-bodyBlue dark:text-blue-dark-high'>
										{delegatorLoading ? <Loader size='small' /> : parseBalance((delegatedData?.delegatedVotesCapital || '0').toString(), 2, true, network)}
									</span>
								</div>
							</div>
						</div>
					</div>
					<Divider
						dashed
						className='m-0 mt-2 border-[2px] border-x-0 border-b-0 border-[#D2D8E0]'
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
							{voteData.delegatedVotes.map((data: any, i: number) => (
								<DelegationListRow
									key={i}
									voteType={voteType}
									voteData={data}
								/>
							))}
						</div>
						{delegatorLoading ? (
							<Skeleton.Button active />
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
				</div>
			</StyledCollapse.Panel>
		</StyledCollapse>
	) : (
		<div
			className={`w-[552px] border-x-0 border-y-0 border-t border-solid border-[#D2D8E0] px-[10px] py-4 text-sm text-bodyBlue dark:text-blue-dark-high ${className} dark:bg-section-dark-overlay`}
		>
			<Title />
		</div>
	);
};

export default React.memo(VoterRow);
