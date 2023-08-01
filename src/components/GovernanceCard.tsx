// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined, DislikeOutlined, LikeOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Divider, Modal, Progress, Skeleton, Tooltip } from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { poppins } from 'pages/_app';
import React, { FC, useContext, useEffect, useState } from 'react';
import { UserDetailsContext } from 'src/context/UserDetailsContext';
import { noTitle } from 'src/global/noTitle';
import useCurrentBlock from 'src/hooks/useCurrentBlock';
import OnchainCreationLabel from 'src/ui-components/OnchainCreationLabel';
import StatusTag from 'src/ui-components/StatusTag';
import getRelativeCreatedAt from 'src/util/getRelativeCreatedAt';
import { WarningMessageIcon } from '~src/ui-components/CustomIcons';
import TopicTag from '~src/ui-components/TopicTag';
import BN from 'bn.js';
import { chainProperties } from 'src/global/networkConstants';
import NewChatIcon from '~assets/icons/chat-icon.svg';
import TagsIcon from '~assets/icons/tags-icon.svg';
import { getFormattedLike } from '~src/util/getFormattedLike';
import { useApiContext, useNetworkContext } from '~src/context';
import formatBnBalance from '~src/util/formatBnBalance';
import { useRouter } from 'next/router';
import getQueryToTrack from '~src/util/getQueryToTrack';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { getStatusBlock } from '~src/util/getStatusBlock';
import { IPeriod } from '~src/types';
import { getPeriodData } from '~src/util/getPeriodData';
import { formatedBalance } from '~src/util/formatedBalance';
import { formatBalance } from '@polkadot/util';

const BlockCountdown = dynamic(() => import('src/components/BlockCountdown'),{
	loading: () => <Skeleton.Button active />,
	ssr: false
});

interface IGovernanceProps {
	postReactionCount: {
		'👍': number;
		'👎': number;
	};
	address: string;
	username?: string;
	className?: string
	commentsCount: number
	created_at?: Date
	end?: number
	method?: string
	onchainId?: string | number | null
	status?: string | null
	tipReason?: string
	title?: string | null
	topic?: string
	isTip?: boolean;
	tip_index?: number | null;
	isCommentsVisible?: boolean;
	tags?: string[] | [];
	spam_users_count?: number;
	cid?:string;
	requestedAmount?:number;
  tally?:  any;
  timeline?: any[];
  statusHistory?: any[];
  index?: number;
}

const ZERO = new BN(0);

const GovernanceCard: FC<IGovernanceProps> = (props) => {
	const {
		postReactionCount,
		address,
		cid,
		className,
		commentsCount,
		created_at,
		end = 0,
		method,
		onchainId,
		status,
		tipReason,
		title,
		topic,
		isTip,
		tip_index,
		isCommentsVisible = true,
		username,
		tags,
		spam_users_count,
		requestedAmount,
		tally,
		timeline,
		statusHistory=[],
		index = 0
	} = props;
	const router= useRouter();
	const currentUser = useContext(UserDetailsContext);
	let titleString = title || method || tipReason || noTitle;
	const { network } = useNetworkContext();
	const titleTrimmed = titleString.match(/.{1,80}(\s|$)/g)![0];
	titleString = `${titleTrimmed} ${titleTrimmed.length != titleString.length ? '...' : ''}`;

	const mainTitle = <span className={tipReason && 'tipTitle'}>{titleString}</span>;
	const subTitle = title && tipReason && method && <h5>{title}</h5>;
	const currentBlock = useCurrentBlock()?.toNumber() || 0;
	const ownProposal = currentUser?.addresses?.includes(address);
	const relativeCreatedAt = getRelativeCreatedAt(created_at);
	const [tagsModal, setTagsModal] = useState<boolean>(false);

	const tokenDecimals = chainProperties[network]?.tokenDecimals;
	const { api, apiReady } = useApiContext();
	const requestedAmountFormatted = requestedAmount ? new BN(requestedAmount).div(new BN(10).pow(new BN(tokenDecimals))).toString() : 0;
	const [tallyData, setTallyData] = useState({
		ayes: ZERO || 0,
		nays: ZERO || 0,
		support: ZERO || 0
	});

	const bnToIntBalance = function (bn: BN): number{
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};
	const unit =`${chainProperties[network]?.tokenSymbol}`;
	const ayeVotesNumber =  bnToIntBalance(tallyData.ayes || ZERO);
	const totalVotesNumber = bnToIntBalance(tallyData.ayes?.add(tallyData.nays|| ZERO) || ZERO);
	const ayePercent = ayeVotesNumber/totalVotesNumber*100;
	const nayPercent = 100 - ayePercent;
	const isAyeNaN = isNaN(ayePercent);
	const isNayNaN = isNaN(nayPercent);
	const [decision, setDecision] = useState<IPeriod>();
	const [remainingTime, setRemainingTime] = useState<string>('');
	const decidingBlock = statusHistory.filter((status) => status.status === 'Deciding' )?.[0]?.block || 0;
	const convertRemainingTime = (preiodEndsAt: any ) => {

		const diffMilliseconds = preiodEndsAt.diff();

		const diffDuration = dayjs.duration(diffMilliseconds);
		const diffDays = diffDuration.days();
		const diffHours = diffDuration.hours();
		const diffMinutes = diffDuration.minutes();
		if(!diffDays){
			return (`${diffHours}hrs : ${diffMinutes}mins `);
		}
		return (`${diffDays}d  : ${diffHours}hrs : ${diffMinutes}mins `);

	};

	useEffect(() => {

		if( !api || !apiReady || !status || !network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		if(['confirmed', 'executed', 'timedout', 'cancelled', 'rejected'].includes(status.toLowerCase())){
			setTallyData({
				ayes: String(tally?.ayes).startsWith('0x') ? new BN(tally?.ayes || 0, 'hex') : new BN(tally?.ayes || 0),
				nays: String(tally?.nays).startsWith('0x') ? new BN(tally?.nays || 0, 'hex') : new BN(tally?.nays || 0),
				support: String(tally?.support).startsWith('0x') ? new BN(tally?.support || 0, 'hex') : new BN(tally?.support || 0)
			});
			return;
		}

		(async () => {
			const referendumInfoOf = await api.query.referenda.referendumInfoFor(onchainId);
			const parsedReferendumInfo: any = referendumInfoOf.toJSON();
			if (parsedReferendumInfo?.ongoing?.tally) {
				setTallyData({
					ayes: typeof parsedReferendumInfo.ongoing.tally.ayes === 'string' ? new BN(parsedReferendumInfo.ongoing.tally.ayes.slice(2), 'hex') : new BN(parsedReferendumInfo.ongoing.tally.ayes),
					nays: typeof parsedReferendumInfo.ongoing.tally.nays === 'string' ? new BN(parsedReferendumInfo.ongoing.tally.nays.slice(2), 'hex') : new BN(parsedReferendumInfo.ongoing.tally.nays),
					support: typeof parsedReferendumInfo.ongoing.tally.support === 'string' ? new BN(parsedReferendumInfo.ongoing.tally.support.slice(2), 'hex') : new BN(parsedReferendumInfo.ongoing.tally.support)
				});
			} else {
				setTallyData({
					ayes: new BN(tally?.ayes || 0, 'hex'),
					nays: new BN(tally?.nays || 0, 'hex'),
					support: new BN(tally?.support || 0, 'hex')
				});
			}
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status, api, apiReady]);

	useEffect(() => {
		if(!window )return;
		const trackDetails = getQueryToTrack(router.pathname.split('/')[1], network);

		if (!created_at) return;

		const decidingStatusBlock = getStatusBlock( timeline || [], ['ReferendumV2', 'FellowshipReferendum'], 'Deciding');

		const prepare = getPeriodData(network, dayjs(created_at), trackDetails, 'preparePeriod');

		const decisionPeriodStartsAt = ((decidingStatusBlock && decidingStatusBlock.timestamp)? dayjs(decidingStatusBlock.timestamp): prepare.periodEndsAt);
		const decision = getPeriodData(network, decisionPeriodStartsAt, trackDetails, 'decisionPeriod');
		setDecision(decision);
		setRemainingTime(convertRemainingTime(decision.periodEndsAt));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	return (
		<>
			<div className={`${className} ${ownProposal && 'border-l-pink_primary border-l-4'} border-2 border-[#DCDFE350] hover:border-pink_primary hover:shadow-xl transition-all duration-200 sm:p-3 min-h-[120px] sm:flex xs:hidden`}>
				<div className="sm:flex flex-col sm:justify-between flex-1 sm:mt-2.5">
					<div className="flex justify-between items-center">
						<div className="flex flex-grow">
							<span className='font-medium text-center flex-none sm:w-[120px] text-bodyBlue'>#{isTip? tip_index: onchainId}</span>
							<OnchainCreationLabel address={address} username={username} />
						</div>
						<div className="flex justify-end items-center">
							{status && <StatusTag className='sm:mr-10' status={status} />}
						</div>
					</div>
					<div className="flex justify-between items-center mt-1">
						<div className="flex flex-grow ml-[120px]">
							<h1 className='text-bodyBlue text-sm mt-0.5 flex overflow-hidden lg:max-w-none'>
								<span className='break-all text-bodyBlue font-medium text-sm'>{ mainTitle }</span>
							</h1>
							<h2 className='text-bodyBlue font-medium text-sm'>{subTitle}</h2>
						</div>
						{
							requestedAmount &&
							<div className='flex justify-center items-center'>
								{requestedAmount > 100 ?
									<span className='text-lightBlue text-sm font-medium sm:mr-[2.63rem] whitespace-pre'>{requestedAmountFormatted} {chainProperties[network]?.tokenSymbol}</span>
									:
									<span className='text-lightBlue text-sm font-medium sm:mr-[2.65rem] whitespace-pre'>{requestedAmountFormatted} {chainProperties[network]?.tokenSymbol}</span>
								}
							</div>
						}
					</div>
					<div className="font-medium text-bodyBlue text-xs sm:flex xs:hidden flex-col lg:flex-row items-start lg:items-center sm:mb-1 sm:mt-0 sm:ml-[120px]">
						<div className='flex items-center gap-x-2 lg:h-[32px]'>
							<div className='xs:hidden sm:flex items-center justify-center gap-x-1.5'>
								<LikeOutlined style={{ color: '#485F7D' }} />
								<span className='text-lightBlue'>{getFormattedLike(postReactionCount['👍'])}</span>
							</div>
							<div className='xs:hidden sm:flex items-center justify-center gap-x-1.5 mr-0.5'>
								<DislikeOutlined style={{ color: '#485F7D' }} />
								<span className='text-lightBlue'>{getFormattedLike(postReactionCount['👎'])}</span>
							</div>
							{
								isCommentsVisible?
									<>
										<div className='xs:hidden text-lightBlue sm:flex items-center'>
											<NewChatIcon style={{
												color: '#485F7D'
											}} className='mr-1 text-lightBlue' /> {commentsCount}
										</div>
									</>
									: null
							}
							{tags && tags.length > 0 && <>
								<Divider type="vertical" className='max-lg:hidden' style={{ borderLeft: '1px solid #90A0B7' }} />
								{ tags?.slice(0,2).map((tag, index) =>
									(<div key={index} className='text-lightBlue rounded-xl px-[14px] py-1 border-[#D2D8E0] border-solid border-[1px] font-medium text-[10px]' >
										{tag}
									</div>))}
								{tags.length>2 && <span className='text-bodyBlue' style={{ background:'#D2D8E080' , borderRadius:'20px', padding:'4px 8px' }} onClick={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(true);}}>
                +{tags.length-2}
								</span>}
							</>}

							<Divider type="vertical" style={{ borderLeft: '1px solid #485F7D' }} />
							{
								cid ?
									<>
										<Link href={`https://ipfs.io/ipfs/${cid}`} target="_blank"> <PaperClipOutlined /> IPFS</Link>
										<Divider type="vertical" style={{ borderLeft: '1px solid #485F7D' }} />
									</> : null
							}
							{relativeCreatedAt && <>
								<div className='flex text-lightBlue items-center sm:mt-0'>
									<ClockCircleOutlined className='mr-1' /> <span className='whitespace-nowrap'>{relativeCreatedAt}</span>
								</div>
							</>}
							{(decision && !remainingTime.includes('-')) && <>
								<Divider type="vertical" className='max-sm:hidden' style={{ borderLeft: '1px solid #90A0B7' }} />
								<Tooltip overlayClassName='max-w-none' title={<div className={`p-1.5 ${poppins.className} ${poppins.variable} whitespace-nowrap flex items-center text-xs`}>{ `Deciding ends in ${remainingTime} ${(decidingBlock !== 0) ? `#${decidingBlock}` :''}`}</div>} color='#575255'>
									<div className='min-w-[30px] mt-2'>
										<Progress strokeWidth={5} percent={decision.periodPercent || 0} strokeColor='#407AFC' trailColor='#D4E0FC'/>
									</div>
								</Tooltip>
							</>}
							<>
								<Divider type="vertical" className='max-sm:hidden' style={{ borderLeft: '1px solid #90A0B7' }} />
								<Tooltip color='#575255' overlayClassName='max-w-none' title={<div className={`flex flex-col whitespace-nowrap text-xs gap-1 p-1.5 ${poppins.className} ${poppins.variable}`}>
									<span>Aye = {formatedBalance(tallyData.ayes.toString() || '0', unit)} {unit} ({Math.round(isAyeNaN ? 50 : ayePercent)}%) </span>
									<span>Nay = {formatedBalance(tallyData.nays.toString() || '0', unit)} {unit} ({Math.round(isNayNaN ? 50 : nayPercent)}%) </span>
								</div>}>
									<div>
										<Progress size={30} percent={50} success={{ percent: Math.round((isAyeNaN? 50: ayePercent)/2) }} type="circle" className='progress-rotate mt-3' gapPosition='bottom' strokeWidth={16} trailColor={((index%2) === 0) ? '#fbfbfc' : 'white' } />
									</div>
								</Tooltip>
							</>

							{
								topic?
									<div className='flex items-center sm:-mt-1'>
										<Divider type="vertical" className='sm:mt-1' style={{ borderLeft: '1px solid #485F7D' }} />
										<TopicTag className='sm:mt-0 sm:mx-1' topic={topic} />
									</div>
									: null
							}
						</div>

						{!!end && !!currentBlock &&
							<div className="flex text-lightBlue items-center">
								<Divider className='hidden lg:inline-block' type="vertical" style={{ borderLeft: '1px solid #485F7D' }} />
								<ClockCircleOutlined className='mr-1' />
								{
									end > currentBlock
										? <span><BlockCountdown endBlock={end}/> remaining</span>
										: <span>ended <BlockCountdown endBlock={end}/></span>
								}
							</div>
						}

					</div>
				</div>
				<Modal
					open= {tagsModal}
					onCancel={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(false);}}
					footer={false}
					className={`${poppins.variable} ${poppins.className} max-w-full shrink-0  max-sm:w-[100%] h-[120px]`}
				><div className='flex'>
						<h2 className='text-lg tracking-wide font-medium text-bodyBlue mb-2'>
							<TagsIcon className='mr-2' />
							Tags
						</h2>
					</div>
					<div className='w-full h-[1px] bg-[#D2D8E0]' />
					<div className='flex gap-2 flex-wrap mt-4' >{tags && tags.length>0 && <>{ tags?.map((tag,index) =>
						(<div key={index} className='rounded-xl border-solid border-[1px] border-[#D2D8E0] px-[16px] py-[2px] font-normal text-[10px] text-lightBlue' >
							{tag}
						</div>))}
					</>}</div>
				</Modal>
			</div>
			<div className={`${className} ${ownProposal && 'border-l-pink_primary border-l-4'} border-2 border-grey_light hover:border-pink_primary hover:shadow-xl transition-all duration-200  xs:px-2 xs:py-2 md:pb-6 min-h-[147px] xs:flex h-auto sm:hidden`}>
				<div className="sm:hidden xs:flex flex-col flex-1 xs:mt-1">
					<div className="xs:flex sm:hidden justify-between sm:my-0">
						{
							topic &&
							<div>
								<TopicTag className='xs:mx-1' topic={topic} />
							</div>
						}
						{
							requestedAmount &&
							<div className='xs:mr-5 sm:m-0'>
								{requestedAmount > 100 ?
									<span className='text-lightBlue text-sm font-medium'>{requestedAmountFormatted} {chainProperties[network]?.tokenSymbol}</span>
									:
									<span className='text-lightBlue text-sm font-medium'>{requestedAmount} {chainProperties[network]?.tokenSymbol}</span>
								}
							</div>
						}
					</div>
					<div className='sm:hidden xs:flex justify-between items-center gap-x-2'>
						{
							spam_users_count && typeof spam_users_count === 'number' && spam_users_count > 0?
								<div className='flex items-center justify-center'>
									<Tooltip color="#E5007A" title="This post could be a spam.">
										<WarningMessageIcon className='text-xl text-[#FFA012]' />
									</Tooltip>
								</div>
								: null
						}
					</div>
					<div className='max-xs-hidden my-3 mx-1 text-bodyBlue font-medium text-sm'>
						#{isTip? tip_index: onchainId} {mainTitle} {subTitle}
					</div>

					<div className="font-medium text-bodyBlue text-xs sm:hidden xs:flex flex-col lg:flex-row lg:items-center pl-1 gap-3">
						<div className="sm:hidden xs:flex xs:justify-start items-center h-[30px] flex-shrink-0">
							<OnchainCreationLabel address={address} username={username} />
							<Divider type="vertical" className='max-lg:hidden xs:inline-block xs:mt-0.5' style={{ borderLeft: '1px solid #485F7D' }} />
							{relativeCreatedAt && <>
								<div className='flex text-lightBlue mt-0 items-center'>
									<ClockCircleOutlined className='mr-1 mt-0' /><span> {relativeCreatedAt}</span>
								</div>
							</>}
							{(decision && !remainingTime.includes('-')) && <div className='flex items-center'>
								<Divider type="vertical" className='max-lg:hidden xs:inline-block xs:mt-0.5' style={{ borderLeft: '1px solid #90A0B7' }} />
								<div className='min-w-[30px] mt-2'>
									<Progress percent={decision.periodPercent || 0} strokeColor='#407AFC' trailColor='#D4E0FC' strokeWidth={5} />
								</div>
							</div>}
							<div className='flex items-center'>
								<Divider type="vertical" className='max-lg:hidden xs:inline-block xs:mt-0.5' style={{ borderLeft: '1px solid #90A0B7' }} />
								<div>
									<Progress size={30} percent={50} success={{ percent: Math.round((isAyeNaN? 50: ayePercent)/2) }} type="circle" className='progress-rotate mt-3' gapPosition='bottom' strokeWidth={16} trailColor={( (index%2) === 0) ? '#fbfbfc' : 'white' }/>
								</div>
							</div>
						</div>

						<div className='xs:flex justify-between xs:gap-x-2 mb-1 items-center'>
							{tags && tags.length > 0 && <div className='flex'>
								<Divider type="vertical" className='max-lg:hidden' style={{ borderLeft: '1px solid #90A0B7' }} />
								<div className='flex gap-1'>
									{ tags?.slice(0,2).map((tag, index) =>
										(<div key={index} className='text-lightBlue rounded-xl px-[14px] py-1 border-[#D2D8E0] border-solid border-[1px] font-medium text-[10px]' >
											{tag}
										</div>))}
									{tags.length>2 && <span className='text-bodyBlue' style={{ background:'#D2D8E080' , borderRadius:'20px', padding:'4px 8px' }} onClick={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(true);}}>
                +{tags.length-2}
									</span>}</div>
							</div>}
							{tags && tags.length > 0?
								status  && <StatusTag className='xs:mt-0 xs:absolute xs:right-[5%]' status={status} />
								: null}
							{
								!tags || tags.length === 0?
									status  &&
									<StatusTag className='mt-0.5' status={status} />
									: null
							}
						</div>

					</div>
				</div>
			</div>
		</>
	);
};

export default styled(GovernanceCard)`
.ant-progress.ant-progress-circle .ant-progress-text{
  display: none;
}
.ant-progress .ant-progress-inner:not(.ant-progress-circle-gradient) .ant-progress-circle-path{
  stroke: #FF3C5F;
}
.ant-progress-circle > circle:nth-child(3){
  stroke: #2ED47A !important;
}
.ant-progress .ant-progress-text{
  display: none;
}

.ant-progress.ant-progress-show-info .ant-progress-outer {
    margin-inline-end: 0px; 
     padding-inline-end: 0px;
}
.progress-rotate{
transform: rotate(-87deg);
}
`;
