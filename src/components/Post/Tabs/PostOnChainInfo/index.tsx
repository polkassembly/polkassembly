// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton } from 'antd';
import { dayjs } from 'dayjs-init';
import dynamic from 'next/dynamic';
import React, { FC } from 'react';
import ExternalLinks from 'src/components/ExternalLinks';
import { chainProperties } from 'src/global/networkConstants';
import Address from 'src/ui-components/Address';
import blockToTime from 'src/util/blockToTime';
import formatBnBalance from 'src/util/formatBnBalance';
import styled from 'styled-components';
import { useNetworkContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import { useCurrentBlock } from '~src/hooks';
import { getBlockLink } from '~src/util/subscanCheck';

import OnchainInfoWrapper from './OnchainInfoWrapper';
import Link from 'next/link';

const ArgumentsTableJSONView = dynamic(() => import('./ArgumentsTableJSONView'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

const BlockCountdown = dynamic(() => import('src/components/BlockCountdown'), {
	loading: () => <Skeleton.Button active /> ,
	ssr: false
});

const BlocksToTime = dynamic(() => import('src/components/BlocksToTime'), {
	loading: () => <Skeleton.Button active /> ,
	ssr: false
});

export interface IOnChainInfo {
	cid?:string;
	codec?:string;
	code?:string;
	version?:string;
	vote_threshold?: string;
	proposer?: string;
	delay?: number;
	end?: number;
	ended_at_block?: number;
	status?: string;
	method?: string;
	description?: any;
	ended_at?: string;
	deposit?: number | string;
	bond?: number | string;
	reward?: number | string;
	fee?: number | string;
	curator_deposit?: number | string;
	payee?: string;
	curator?: string;
	hash?: string;
	member_count?: number;
	motion_method?: string;
	origin?: string;
	track_number?: number;
	enactment_after_block?: number | string;
	enactment_at_block?: number | string;
	deciding?: {
		confirming?: number | string;
		since?: number | string;
	}
	decision_deposit_amount?: string | number;
	submission_deposit_amount?: string | number;
	submitted_amount?: string | number;
	proposal_arguments?: any;
	proposed_call?: any;
	post_id?: string | number;
	statusHistory?: {
		block: number;
	}[];
}

interface IPostOnChainInfoProps {
	className?: string;
	onChainInfo?: IOnChainInfo;
	proposalType: ProposalType;
	handleOpenSidebar: (address: string) => void;
}
export const tipStatus = {
	CLOSED: 'Closed',
	CLOSING: 'Closing',
	OPENED: 'Opened',
	RETRACTED: 'Retracted'
};

export const getBlockNumber = (statusHistory?: {
	block: number;
}[]) => {
	if (statusHistory && Array.isArray(statusHistory) && statusHistory.length > 0) {
		const blockNumber = Number(statusHistory[0].block);
		if (!isNaN(blockNumber)) {
			return blockNumber;
		}
	}
};

const PostOnChainInfo: FC<IPostOnChainInfoProps> = (props) => {
	const { network } = useNetworkContext();

	const { className, handleOpenSidebar, onChainInfo, proposalType } = props;
	const currentBlock = useCurrentBlock();
	if (!onChainInfo) return null;

	const { cid, code, codec, delay, description, end, status, proposer, vote_threshold, method, post_id, ended_at, proposed_call, bond, curator, curator_deposit, deciding, decision_deposit_amount, submission_deposit_amount, deposit, enactment_after_block, enactment_at_block, ended_at_block, fee, hash, member_count, motion_method, origin, proposal_arguments, submitted_amount, reward, payee, statusHistory, version } = onChainInfo;

	const blockNumber = getBlockNumber(statusHistory);

	const formattedBlockToTime = (blockNo: number) => {
		if(!currentBlock) return;
		const { seconds } = blockToTime(currentBlock.toNumber() - blockNo, network);

		if (seconds === 0) {
			return dayjs.utc().format('DD MMM YYYY');
		}
		const duration = dayjs.duration({ seconds });
		const date = dayjs.utc().subtract(duration).format('DD MMM YYYY');
		return date;
	};

	const url = getBlockLink(network);

	return (
		<>
			<div className={`${className} mt-4`}>
				<OnchainInfoWrapper>
					{
						proposer?
							<div
								className='md:hidden text-pink_primary cursor-pointer mb-5'
								onClick={() => handleOpenSidebar(proposer)}
							>
							View Other Proposals
							</div>
							: null
					}
					<h5 className='mb-5 font-bold text-base'>Metadata</h5>
					<ul className='list-none flex flex-col gap-y-2'>
						{
							proposer?
								<li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
									<h6 className='col-span-2'>Proposer</h6>
									<article className='flex gap-x-2 col-span-4 md:col-span-6 overflow-hidden'>
										<Address displayInline={true} address={proposer}/>
										<div
											className='hidden md:block text-pink_primary cursor-pointer ml-auto'
											onClick={() => handleOpenSidebar(proposer)}
										>
										View Other Proposals
										</div>
									</article>
								</li>
								: null
						}
						{submitted_amount && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
							<h6 className='col-span-2'>Submitted</h6>
							<div className='text-navBlue col-span-4 md:col-span-6 overflow-hidden'>
								{formatBnBalance(String(submitted_amount), { numberAfterComma: 2, withUnit: true }, network)}
							</div>
						</li>}
						{origin && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
							<h6 className='col-span-2'>Origin</h6>
							<div className='text-navBlue col-span-4 md:col-span-6 overflow-hidden'>
								{origin.split(/(?=[A-Z])/).join(' ')}
							</div>
						</li>}
						{enactment_after_block && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
							<h6 className='col-span-2'>Enactment After</h6>
							<div className='text-navBlue col-span-4 md:col-span-6 overflow-hidden'>
								{String(enactment_after_block).length < 8 ? enactment_after_block :
									<div>
										<span>{formattedBlockToTime(Number(enactment_after_block))}</span>
										<a href={`${url}/${enactment_after_block}`} target='_blank' rel='noreferrer' className='ml-3 text-pink_secondary'>#{enactment_after_block}</a>
									</div>
								}
							</div>
						</li>}
						{enactment_at_block && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-b py-1.5'>
							<h6 className='col-span-2'>Enactment At</h6>
							<div className='text-navBlue col-span-4 md:col-span-6 overflow-hidden'>
								{String(enactment_at_block).length < 8 ? enactment_at_block :
									<div>
										<span>{formattedBlockToTime(Number(enactment_at_block))}</span>
										<a href={`${url}/${enactment_at_block}`} target='_blank' rel='noreferrer' className='ml-3 text-pink_secondary'>#{enactment_at_block}</a>
									</div>
								}
							</div>
						</li>}
						{deciding && deciding.since && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
							<h6 className='col-span-2'>Deciding Since</h6>
							<div className='text-navBlue col-span-4 md:col-span-6 overflow-hidden'>
								{`${deciding.since}`.length < 8 ? deciding.since :
									<div>
										<span>{formattedBlockToTime(Number(deciding.since))}</span>
										<a href={`${url}/${deciding.since}`} target='_blank' rel='noreferrer' className='ml-3 text-pink_secondary'>#{deciding.since}</a>
									</div>
								}
							</div>
						</li>}
						{deciding && deciding.confirming && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
							<h6 className='col-span-2'>Confirm Started</h6>
							<div className='text-navBlue col-span-4 md:col-span-6 overflow-hidden'>
								{`${deciding.confirming}`.length < 8 ? deciding.confirming :
									<div>
										<span>{formattedBlockToTime(Number(deciding.confirming))}</span>
										<a href={`${url}/${deciding.confirming}`} target='_blank' rel='noreferrer' className='ml-3 text-pink_secondary'>#{deciding.confirming}</a>
									</div>
								}
							</div>
						</li>}
						{decision_deposit_amount && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
							<h6 className='col-span-2'>Decision Deposit</h6>
							<div className='text-navBlue col-span-4 md:col-span-6 overflow-hidden'>
								{formatBnBalance(String(decision_deposit_amount), { numberAfterComma: 2, withUnit: true }, network)}
							</div>
						</li>}
						{submission_deposit_amount && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
							<h6 className='col-span-2'>Submission Deposit</h6>
							<div className='text-navBlue col-span-4 md:col-span-6 overflow-hidden'>
								{formatBnBalance(String(submission_deposit_amount), { numberAfterComma: 2, withUnit: true }, network)}
							</div>
						</li>}
						{ended_at_block && ended_at && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b pb-1.5'>
							{status === tipStatus.CLOSING
								?
								<>
									<h6 className='col-span-2 pt-1.5'>Closing</h6>
									<div className='col-span-4 md:col-span-6 overflow-hidden'>
										<BlockCountdown endBlock={ended_at_block}/>
									</div>
								</>
								:  status === tipStatus.CLOSED
									?
									<>
										<h6 className='col-span-2 pt-1.5'>Closed</h6>
										<div className='text-navBlue col-span-4 md:col-span-6 overflow-hidden'>
											{dayjs.utc(ended_at).format('DD MMM YYYY, HH:mm:ss')}
										</div>
									</>
									: <>
										<h6 className='col-span-2 pt-1.5'>Status</h6>
										<div className='text-navBlue col-span-4 md:col-span-6 overflow-hidden'>
											{status}
										</div>
									</>
							}
						</li>}
						{deposit && network && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
							<h6 className='col-span-2 text-base'>Deposit</h6>
							<div className='text-navBlue col-span-4 md:col-span-6'>{(typeof deposit === 'string'? parseInt(deposit): deposit) / Math.pow(10, chainProperties[network]?.tokenDecimals) + ' ' + chainProperties[network]?.tokenSymbol}
							</div>
						</li>}
						{method && method !== motion_method && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
							<h6 className='col-span-2'>Method</h6>
							<div className='text-navBlue col-span-4 md:col-span-6'>{method}</div>
						</li>}
						{end && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
							{status === 'Started'
								?
								<>
									<h6 className='col-span-2'>End</h6>
									<div className='col-span-4 md:col-span-6'>
										<BlockCountdown className='text-navBlue' endBlock={end}/>
									</div>
								</>
								:
								<>
									<h6 className='col-span-2'>Ended</h6>
									<div className='text-navBlue col-span-4 md:col-span-6'>{dayjs.utc(ended_at).format('DD MMM YYYY, HH:mm:ss')}</div>
								</>
							}
						</li>}
						{(delay || delay === 0) &&
						<li className="grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5">
							<h6 className='col-span-2'>Delay</h6>
							<div className='text-navBlue col-span-4 md:col-span-6'><BlocksToTime blocks={delay} /></div>
						</li>
						}
						{vote_threshold &&
						<li className="grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5">
							<h6
								className='col-span-2'
							>
								Vote threshold
							</h6>
							<div
								className='text-navBlue col-span-4 md:col-span-6'
							>
								{vote_threshold}
							</div>
						</li>
						}
						{
							member_count && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
								<h6 className='col-span-2 text-base'>Member count</h6>
								<div className='text-navBlue col-span-4 md:col-span-6 overflow-hidden'>
									{member_count}
								</div>
							</li>
						}
						{
							hash && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
								<h6 className='col-span-2 flex items-center text-base'>Proposal Hash</h6>
								<div className='text-navBlue col-span-4 md:col-span-6'>
									{hash}
								</div>
							</li>
						}
						{curator && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
							<h6 className='col-span-2'>Curator</h6>
							<div className='col-span-4 md:col-span-6 overflow-hidden'>
								<Address  displayInline={true} address={curator}/>
							</div>
						</li>}
						{reward && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
							<h6 className='col-span-2'>Reward</h6>
							<div className='text-navBlue col-span-4 md:col-span-6'>
								{(typeof reward === 'string'? parseInt(reward): reward) / Math.pow(10, chainProperties[network]?.tokenDecimals) + ' ' + chainProperties[network]?.tokenSymbol}
							</div>
						</li>}
						{fee && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
							<h6 className='col-span-2'>Fee</h6>
							<div className='text-navBlue col-span-4 md:col-span-6'>
								{(typeof fee === 'string'? parseInt(fee): fee) / Math.pow(10, chainProperties[network]?.tokenDecimals) + ' ' + chainProperties[network]?.tokenSymbol}
							</div>
						</li>}
						{curator_deposit && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
							<h6 className='col-span-2'>Curator Deposit</h6>
							<div className='text-navBlue col-span-4 md:col-span-6'>
								{(typeof curator_deposit === 'string'? parseInt(curator_deposit): curator_deposit) / Math.pow(10, chainProperties[network]?.tokenDecimals) + ' ' + chainProperties[network]?.tokenSymbol}
							</div>
						</li>}
						{bond && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
							<h6 className='col-span-2'>Bond</h6>
							<div className='text-navBlue col-span-4 md:col-span-6'>
								{(typeof bond === 'string'? parseInt(bond): bond) / Math.pow(10, chainProperties[network]?.tokenDecimals) + ' ' + chainProperties[network]?.tokenSymbol}
							</div>
						</li>}
						{payee && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
							<h6 className='col-span-2'>Payee</h6>
							<div className='col-span-4 md:col-span-6 overflow-hidden'>
								<Address displayInline={true} address={payee}/>
							</div>
						</li>}
						{
							motion_method && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
								<h6 className='col-span-2 text-base'>Motion&apos;s method</h6>
								<div className={`col-span-4 md:col-span-6 ${motion_method === 'reject_proposal' ? 'bold-red-text' : 'text-navBlue'}`}>
									{motion_method}
								</div>
							</li>
						}
						{
							cid && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
								<h6 className='col-span-2 text-base'>IPFS</h6>
								<div className='text-navBlue col-span-4 md:col-span-6'>
									<Link href={`https://ipfs.io/ipfs/${cid}`} target="_blank">{`ipfs.io/ipfs/${cid}`}</Link>
								</div>
							</li>
						}
						{
							cid && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
								<h6 className='col-span-2 text-base'>CID</h6>
								<div className='text-navBlue col-span-4 md:col-span-6'>
									{cid}
								</div>
							</li>
						}
						{
							code && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
								<h6 className='col-span-2 flex items-center text-base'>Code</h6>
								<div className='text-navBlue col-span-4 md:col-span-6'>
									{code}
								</div>
							</li>
						}
						{
							codec && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
								<h6 className='col-span-2 flex items-center text-base'>Codec</h6>
								<div className='text-navBlue col-span-4 md:col-span-6'>
									{codec}
								</div>
							</li>
						}
						{
							version && <li className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b py-1.5'>
								<h6 className='col-span-2 flex items-center text-base'>Version</h6>
								<div className='text-navBlue col-span-4 md:col-span-6'>
									{version}
								</div>
							</li>
						}
					</ul>
					{
						proposal_arguments &&
					<div className='mt-7'>
						<h5 className='font-bold text-base mb-3'>Call Arguments</h5>
						{
							proposal_arguments?.description?
								<div className='grid grid-cols-6 md:grid-cols-8 gap-x-5 border-0 border-[#e5e7eb] border-solid border-b mt-5'>
									<h6 className='col-span-6 md:col-span-2 text-base'>Description</h6>
									<p className='text-navBlue leading-6 col-span-6'>{proposal_arguments?.description}</p>
								</div>
								: null
						}
						{
							proposal_arguments?.args?
								<div>
									<ArgumentsTableJSONView
										postArguments={proposal_arguments.args}
										showAccountArguments={true}

									/>
								</div>
								: null
						}
					</div>
					}
					{
						proposed_call?
							<div className="mt-5 flex flex-col gap-y-5">
								<ProposalInfo
									method={method}
									proposed_call={proposed_call}
								/>
							</div>
							: null
					}
					{
						description?
							<div className='grid grid-cols-6 md:grid-cols-8 gap-x-5 mt-5'>
								<h6 className='col-span-6 md:col-span-2 text-base'>Description</h6>
								<p className='text-navBlue leading-6 col-span-6'>{description}</p>
							</div>
							: null
					}
					{
						<ExternalLinks
							className='mt-5'
							proposalType={proposalType}
							onchainId={post_id}
							blockNumber={blockNumber}
						/>
					}
				</OnchainInfoWrapper>
			</div>
		</>
	);
};

export default styled(PostOnChainInfo)`
	h6 {
		font-size: 14px !important;
	}
`;

interface IProposalInfoProps {
	proposed_call?: any;
	method?: string;
}

const ProposalInfo: React.FC<IProposalInfoProps> = (props) => {
	const { proposed_call, method } = props;
	if (!proposed_call) return null;
	return (
		<>
			{
				proposed_call?.method !== method &&
					<div className='grid grid-cols-6 md:grid-cols-8 border-0 border-[#e5e7eb] border-solid border-b gap-x-5'>
						<h6 className='col-span-6 md:col-span-2'>Method</h6>
						<p className='text-navBlue leading-6 col-span-6'>{proposed_call.method}</p>
					</div>
			}
			{
				proposed_call?.section &&
					<div className='grid grid-cols-6 md:grid-cols-8 border-0 border-[#e5e7eb] border-solid border-b gap-x-5'>
						<h6 className='col-span-6 md:col-span-2'>Section</h6>
						<p className='text-navBlue leading-6 col-span-6'>{proposed_call.section}</p>
					</div>
			}
			{
				proposed_call?.description &&
					<div className='grid grid-cols-6 md:grid-cols-8 border-0 border-[#e5e7eb] border-solid border-b gap-x-5'>
						<h6 className='col-span-6 md:col-span-2'>Description</h6>
						<p className='text-navBlue leading-6 col-span-6'>{proposed_call.description}</p>
					</div>
			}
			{
				proposed_call?.args ?
					<div>
						<ArgumentsTableJSONView
							postArguments={proposed_call?.args}
							showAccountArguments={true}
						/>
					</div>
					: null
			}
		</>
	);
};