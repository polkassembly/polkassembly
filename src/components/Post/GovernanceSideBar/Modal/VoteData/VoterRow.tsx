// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useState, useEffect } from 'react';
import Address from 'src/ui-components/Address';
import { VoteType } from '~src/global/proposalType';
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
import { Divider, Skeleton } from 'antd';
import DelegationListRow from './DelegationListRow';
import dayjs from 'dayjs';
import { parseBalance } from './utils/parseBalaceToReadable';
import Loader from '~src/ui-components/Loader';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface IVoterRow {
  className?:string;
  index?: any;
  voteType: VoteType;
  voteData?: any;
  isReferendum2?:boolean,
  setDelegationVoteModal:any,
  currentKey?:any,
  setActiveKey?:any
  tally?:any
  referendumId?:any
  decision?:any
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

const getPercentage =(userVotes:string, totalVotes:string) => {
	if(!totalVotes){
		return;
	}
	if(isNaN(Number(userVotes[userVotes.length-1]))){
		console.log( userVotes);
		userVotes = userVotes.substring(0, userVotes.length-1);
	}
	if(isNaN(Number(totalVotes[totalVotes.length-1]))){
		console.log( totalVotes);
		totalVotes = totalVotes.substring(0, totalVotes.length-1);
	}
	const percentage =  Number(((Number(userVotes) / Number(totalVotes)) * 100).toFixed(2));
	if(percentage < 1){
		return 'less than 1';
	}

	return percentage;

};

const VoterRow: FC<IVoterRow> = ({ currentKey, setActiveKey, voteType, voteData, className, isReferendum2, setDelegationVoteModal, index, tally, referendumId, decision }) => {
	const [active, setActive] = useState<boolean | undefined>(false);
	const { network } = useNetworkContext();
	const [delegatorLoading, setDelegatorLoading] = useState(true);
	const [delegatedData, setDelegatedData] = useState<any>(null);
	useEffect(() => {
		if(!active){
			return;
		}
		if(delegatedData === null){
			(async () => {
				const url = `api/v1/votes/delegationVoteCountAndPower?&postId=${referendumId}&decision=${decision ||'yes'}&type=${voteType}&voter=${voteData.voter}`;
				const { data, error } = await nextApiClientFetch<any>(url);
				if(error){
					console.log('Error in fetching delegated Data');
				}
				if(data){
					const payload = {
						delegatedVotesCapital:data.voteCapital,
						delegator:data.count
					};
					setDelegatedData(payload);
				}
				setDelegatorLoading(false);
			})();
		}

	},[active, decision, delegatedData, referendumId, voteData.voter, voteType]);

	const Title = () => (
		<div className='m-0 p-0'>
			<div className='flex items-center w-full m-0'>
				{voteType === VoteType.REFERENDUM_V2 && voteData?.txnHash ? (
					<a
						href={`https://${network}.moonscan.io/tx/${voteData?.txnHash}`}
						className={`overflow-ellipsis ${isReferendum2 ? 'w-[210px]' : 'w-[250px]'} ${voteData?.decision === 'abstain' ? 'w-[220px]':''}`}
					>
						<Address
							isVoterAddress={true}
							textClassName='w-[200px]'
							isSubVisible={false}
							displayInline={true}
							isShortenAddressLength={false}
							address={voteData?.voter}
						/>
					</a>
				) : (
					<div className={`overflow-ellipsis ${isReferendum2 ? 'w-[210px]' : 'w-[245px]'} ${voteData?.decision === 'abstain' ? 'w-[220px]':''}`} onClick={(e) => e.stopPropagation()}>
						<Address
							textClassName='overflow-ellipsis w-[250px] '
							isSubVisible={false}
							displayInline={true}
							isShortenAddressLength={false}
							address={voteData?.voter}
						/>
					</div>
				)}

				{network !== AllNetworks.COLLECTIVES ? (
					<>
						<div className={`overflow-ellipsis ${isReferendum2 ? 'w-[105px]' : 'w-[150px]'} ${voteData?.decision === 'abstain' ? 'w-[160px]':''}`}>
							{parseBalance((voteData.selfVotingPower || voteData.votingPower).toString(), 2, true, network)}
						</div>
						{voteData?.decision !== 'abstain' &&  <div className={`overflow-ellipsis ${isReferendum2 ? 'w-[115px]' : 'w-[135px]'}`}>
							{`${voteData.lockPeriod === 0 ? '0.1': voteData.lockPeriod}x${voteData?.delegatedVotes?.length > 0  ? '/d' : ''}`}
						</div>}
					</>
				) : (
					<div className={`overflow-ellipsis ${isReferendum2 ? 'w-[120px]' : 'w-[135px]'}`}>
						{voteData?.decision === 'abstain'
							? voteData?.balance?.abstain || 0
							: voteData?.balance?.value || 0}
					</div>
				)}

				{( voteData.totalVotingPower || voteData.votingPower ) && (
					<div className='overflow-ellipsis w-[90px]'>
						{parseBalance((voteData.totalVotingPower || voteData.votingPower).toString(), 2, true, network)}
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
			activeKey={currentKey === index ? 1 : 0}
			onChange={() => setActiveKey(currentKey === index ? null :index)}
		>
			<StyledCollapse.Panel
				className={`rounded-none p-0 ${active ? 'border-x-0 border-y-0 border-b-2 border-solid  border-pink_primary' : ''} gap-[0px] text-bodyBlue`}
				key={1}
				header={<Title />}
			>
				<div className='flex flex-col gap-4'>
					<div className='border-dashed border-[#D2D8E0] border-y-2 border-x-0 flex gap-[52px] py-4 items-center'>
						<span className='text-[#96A4B6] flex gap-1 items-center'>
							<CalenderIcon /> {dayjs(voteData.createdAt.toDate?.()).format('MM/DD/YYYY, h:mm A').toString()}
						</span>
						<span className='flex gap-1 items-center text-lightBlue text-xs font-medium'>
							<PowerIcon />Voting Power <span className='text-[#96A4B6]'>
								{
									getPercentage(
										voteData?.decision === 'abstain'
											? voteData?.balance?.abstain || 0
											: voteData?.balance?.value || 0
										,
										tally)
								}%
							</span>
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
										<VoterIcon /> Votes
									</span>
									<span className='text-xs text-bodyBlue'>
										{
											parseBalance((
												voteData?.decision === 'abstain'
													? voteData?.balance?.abstain || 0
													: voteData?.balance?.value || 0
											).toString(),
											2,
											true,
											network
											)
										}
									</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-[#576D8B] flex items-center gap-1 text-xs'>
										<ConvictionIcon /> Conviction
									</span>
									<span className='text-xs text-bodyBlue'>{voteData.lockPeriod
										? `${voteData.lockPeriod}x${voteData?.delegatedVotes?.length>0 ? '/d' : ''}`
										: '0.01x'}</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-[#576D8B] flex items-center gap-1 text-xs'>
										<CapitalIcon /> Vote Power
									</span>
									<span className='text-xs text-bodyBlue'>
										{
											parseBalance((
												voteData.selfVotingPower || 0
											).toString(),
											2,
											true,
											network
											)
										}
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
										<VoterIcon /> Voting Power
									</span>
									<span className='text-xs text-bodyBlue'>
										{
											parseBalance((
												voteData?.delegatedVotingPower || '0'
											).toString(),
											2,
											true,
											network
											)
										}
									</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-[#576D8B] flex items-center gap-1 text-xs'>
										<EmailIcon /> Delegators
									</span>
									<span className='text-xs text-bodyBlue'>{delegatorLoading ? <Loader size='small'/>: delegatedData?.delegator}</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-[#576D8B] flex items-center gap-1 text-xs'>
										<CapitalIcon /> Capital
									</span>
									<span className='text-xs text-bodyBlue'>
										{
											delegatorLoading ? <Loader size='small'/>:
												parseBalance((
													delegatedData?.delegatedVotesCapital || '0'
												).toString(),
												2,
												true,
												network
												)
										}
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
						{delegatorLoading ? <Skeleton.Button active/>
							: delegatedData?.delegator > 10
							&& <p className='m-0 mt-2 text-xs text-pink_primary font-medium cursor-pointer' onClick={() => setDelegationVoteModal({ isOpen: true, voter:voteData.voter })}>Show More</p>
						}
					</div>
				</div>
			</StyledCollapse.Panel>
		</StyledCollapse>
	): <div className={`w-[552px] px-[10px] py-4 border-x-0 border-y-0 border-t border-solid border-[#D2D8E0] text-sm text-bodyBlue ${className}`}>
		<Title/>
	</div>;
};

export default React.memo(VoterRow);
