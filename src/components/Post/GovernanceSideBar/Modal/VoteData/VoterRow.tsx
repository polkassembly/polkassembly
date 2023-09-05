// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useState } from 'react';
import Address from 'src/ui-components/Address';
import formatBnBalance from 'src/util/formatBnBalance';
import { VoteType } from '~src/global/proposalType';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { network as AllNetworks } from '~src/global/networkConstants';
import { useNetworkContext } from '~src/context';
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
import { Divider } from 'antd';
import DelegationListRow from './DelegationListRow';
import dayjs from 'dayjs';

interface IVoterRow {
  className?:string;
  index?: any;
  voteType: VoteType;
  voteData?: any;
  isReferendum2?:boolean,
  setDelegationVoteModal:any,
}

const StyledCollapse = styled(Collapse)`
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
  .ant-collapse-expand-icon{
	padding:0px !important;
	margin-left: -16px !important;
  }
  @media (max-width: 768px){
    &.ant-collapse-large >.ant-collapse-item >.ant-collapse-header{
        padding: 16px 8px !important;
    }
}
`;

const getDelegatedDetails = (votes:[any]) => {
	let allVotes = 0;
	let votingPower = 0;
	votes?.forEach((vote) => {
		allVotes+=Number(vote.balance.value);
		votingPower += Number(vote.votingPower);
	});
	return [allVotes, votingPower, votes.length];
};

const VoterRow: FC<IVoterRow> = ({ voteType, voteData, className, isReferendum2, setDelegationVoteModal }) => {
	const [active, setActive] = useState<boolean | undefined>(false);
	const { network } = useNetworkContext();
	const [delegatedVotes, delegatedVotingPower, delegators] = getDelegatedDetails(voteData?.delegatedVotes || []);

	const Title = () => (
		<div className='m-0 p-0'>
			<div className='flex items-center w-full m-0'>
				{voteType === VoteType.REFERENDUM_V2 && voteData?.txnHash ? (
					<a
						href={`https://${network}.moonscan.io/tx/${voteData?.txnHash}`}
						className={`overflow-ellipsis ${isReferendum2 ? 'w-[210px]' : 'w-[250px]'}`}
					>
						<Address
							isVoterAddress={true}
							textClassName='w-[100px]'
							isSubVisible={false}
							displayInline={true}
							isShortenAddressLength={false}
							address={voteData?.voter}
						/>
					</a>
				) : (
					<div className={`overflow-ellipsis ${isReferendum2 ? 'w-[210px]' : 'w-[245px]'}`} onClick={(e) => e.stopPropagation()}>
						<Address
							textClassName='overflow-ellipsis w-[200px] '
							isSubVisible={false}
							displayInline={true}
							isShortenAddressLength={false}
							address={voteData?.voter}
						/>
					</div>
				)}

				{network !== AllNetworks.COLLECTIVES ? (
					<>
						<div className={`overflow-ellipsis ${isReferendum2 ? 'w-[105px]' : 'w-[150px]'}`}>
							{formatUSDWithUnits(
								formatBnBalance(
									voteData?.decision === 'abstain'
										? voteData?.balance?.abstain || 0
										: voteData?.balance?.value || 0,
									{
										numberAfterComma: 1,
										withThousandDelimitor: false,
										withUnit: true
									},
									network
								),
								1
							)}
						</div>
						<div className={`overflow-ellipsis ${isReferendum2 ? 'w-[115px]' : 'w-[135px]'}`}>
							{voteData.lockPeriod
								? `${voteData.lockPeriod}x${voteData?.delegatedVotes?.length>0 ? '/d' : ''}`
								: '0.1x'}
						</div>
					</>
				) : (
					<div className={`overflow-ellipsis ${isReferendum2 ? 'w-[120px]' : 'w-[135px]'}`}>
						{voteData?.decision === 'abstain'
							? voteData?.balance?.abstain || 0
							: voteData?.balance?.value || 0}
					</div>
				)}

				{( voteData.totalVotingPower || voteData.votingPower ) && (
					<div className='overflow-ellipsis w-[50px]'>
						{formatUSDWithUnits(
							formatBnBalance(
								voteData.totalVotingPower|| voteData.votingPower,
								{
									numberAfterComma: 1,
									withThousandDelimitor: false,
									withUnit: false
								},
								network
							),
							1
						)}
						{}
					</div>
				)}
			</div>
		</div>
	);
	return  voteData?.delegatedVotes?.length > 0 ? (
		<StyledCollapse
			className={`${
				active
					? 'border-pink_primary border-t-2'
					: 'border-[#D2D8E0] border-t-[1px]'
			} border-0 rounded-none gap-[0px] w-[550px] ${className}`}
			size='large'
			expandIconPosition='end'
			expandIcon={({ isActive }) => {
				setActive(isActive);
				return isActive ? <CollapseUpIcon /> : <CollapseDownIcon />;
			}}
		>
			<StyledCollapse.Panel
				className={`rounded-none p-0 ${active ? 'border-x-0 border-y-0 border-b-2 border-solid  border-pink_primary' : ''} gap-[0px] text-bodyBlue`}
				key={1}
				header={<Title />}
			>
				<div className='flex flex-col gap-4'>
					<div className='border-dashed border-[#D2D8E0] border-y-2 border-x-0 flex gap-[34px] py-4 items-center'>
						<span className='text-[#96A4B6] flex gap-1 items-center'>
							<CalenderIcon /> {dayjs(voteData.createdAt.toDate?.()).format('MMMM D, YYYY h:mm A').toString()}
						</span>
						<span className='flex gap-1 items-center text-lightBlue text-xs font-medium'>
							<PowerIcon /> Voting Power <span className='text-[#96A4B6]'>{formatUSDWithUnits(
								formatBnBalance(
									voteData?.decision === 'abstain'
										? voteData?.balance?.abstain || 0
										: voteData?.balance?.value || 0,
									{
										numberAfterComma: 1,
										withThousandDelimitor: false,
										withUnit: true
									},
									network
								),
								1
							)}</span>
						</span>
					</div>
					<div>
						<p className='text-sm text-bodyBlue font-medium mb-4'>
							Vote Breakdown
						</p>
						<div className='flex justify-between'>
							<div className='w-[200px] flex flex-col gap-1'>
								<div className='text-lightBlue text-xs font-medium'>
									Self Votes
								</div>
								<div className='flex justify-between'>
									<span className='text-[#576D8B] flex items-center gap-1 text-xs'>
										<VoterIcon /> votes
									</span>
									<span className='text-xs text-bodyBlue'>
										{formatUSDWithUnits(
											formatBnBalance(
												voteData?.decision === 'abstain'
													? voteData?.balance?.abstain || 0
													: voteData?.balance?.value || 0,
												{
													numberAfterComma: 1,
													withThousandDelimitor: false,
													withUnit: true
												},
												network
											),
											1
										)}
									</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-[#576D8B] flex items-center gap-1 text-xs'>
										<ConvictionIcon /> Conviction
									</span>
									<span className='text-xs text-bodyBlue'>{voteData.lockPeriod
										? `${voteData.lockPeriod}x${voteData?.delegatedVotes?.length>0 ? '/d' : ''}`
										: '0.1x'}</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-[#576D8B] flex items-center gap-1 text-xs'>
										<CapitalIcon /> Vote Power
									</span>
									<span className='text-xs text-bodyBlue'>
										{formatUSDWithUnits(
											formatBnBalance(
												voteData.selfVotingPower || 0,
												{
													numberAfterComma: 1,
													withThousandDelimitor: false,
													withUnit: true
												},
												network
											),
											1
										)}
									</span>
								</div>
							</div>
							<div className='border-dashed border-[#D2D8E0] border-l-2 border-y-0 border-r-0'></div>
							<div className='w-[200px] flex flex-col gap-1'>
								<div className='text-lightBlue text-xs font-medium'>
									Delegation Votes
								</div>
								<div className='flex justify-between'>
									<span className='text-[#576D8B] flex items-center gap-1 text-xs'>
										<VoterIcon /> votes
									</span>
									<span className='text-xs text-bodyBlue'>
										{formatUSDWithUnits(
											formatBnBalance(
												delegatedVotes.toString(),
												{
													numberAfterComma: 1,
													withThousandDelimitor: false,
													withUnit: true
												},
												network
											),
											1
										)}
									</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-[#576D8B] flex items-center gap-1 text-xs'>
										<EmailIcon /> Delegators
									</span>
									<span className='text-xs text-bodyBlue'>{delegators}</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-[#576D8B] flex items-center gap-1 text-xs'>
										<CapitalIcon /> Capital
									</span>
									<span className='text-xs text-bodyBlue'>
										{formatUSDWithUnits(
											formatBnBalance(
												delegatedVotingPower.toString(),
												{
													numberAfterComma: 1,
													withThousandDelimitor: false,
													withUnit: true
												},
												network
											),
											1
										)}
									</span>
								</div>
							</div>
						</div>
					</div>
					<Divider
						dashed
						className='m-0 mt-2 border-[#D2D8E0] border-[2px] border-x-0 border-b-0'
					/>
					<div>
						<p className='text-sm text-bodyBlue font-medium mb-4'>
							Delegation list
						</p>
						<div className='flex text-xs items-center font-semibold mb-2'>
							<div className='w-[200px] text-lightBlue text-sm font-medium'>
								Delegators
							</div>
							<div className='w-[110px] flex items-center gap-1 text-lightBlue'>
								Amount
							</div>
							{network !== AllNetworks.COLLECTIVES ? (
								<div className='w-[110px] ml-1 flex items-center gap-1 text-lightBlue'>
									Conviction
								</div>
							) : null}
							<div className='w-[100px] flex items-center gap-1 text-lightBlue'>
								Voting Power
							</div>
						</div>
						<div className='pr-2 max-h-[70px] overflow-y-auto flex flex-col gap-1'>
							{voteData.delegatedVotes.map((data:any, i:number) => <DelegationListRow key={i} voteType={voteType} voteData={data} />)}
						</div>
						<p className='m-0 mt-2 text-xs text-pink_primary font-medium cursor-pointer' onClick={() => setDelegationVoteModal({ isOpen: true, voter:voteData.voter })}>Show More</p>
					</div>
				</div>
			</StyledCollapse.Panel>
		</StyledCollapse>
	): <div className={`w-[552px] px-[10px] py-4 border-x-0 border-y-0 border-t border-solid border-[#D2D8E0] text-sm text-bodyBlue ${className}`}>
		<Title/>
	</div>;
};

export default React.memo(VoterRow);
