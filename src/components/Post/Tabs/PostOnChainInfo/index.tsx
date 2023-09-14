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
	loading: () => <Skeleton active />,
	ssr: false
});

const BlockCountdown = dynamic(() => import('src/components/BlockCountdown'), {
	loading: () => <Skeleton.Button active />,
	ssr: false
});

const BlocksToTime = dynamic(() => import('src/components/BlocksToTime'), {
	loading: () => <Skeleton.Button active />,
	ssr: false
});

export interface IOnChainInfo {
	cid?: string;
	codec?: string;
	code?: string;
	version?: string;
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
	};
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
}
export const tipStatus = {
	CLOSED: 'Closed',
	CLOSING: 'Closing',
	OPENED: 'Opened',
	RETRACTED: 'Retracted'
};

export const getBlockNumber = (
	statusHistory?: {
		block: number;
	}[]
) => {
	if (statusHistory && Array.isArray(statusHistory) && statusHistory.length > 0) {
		const blockNumber = Number(statusHistory[0].block);
		if (!isNaN(blockNumber)) {
			return blockNumber;
		}
	}
};

const PostOnChainInfo: FC<IPostOnChainInfoProps> = (props) => {
	const { network } = useNetworkContext();

	const { className, onChainInfo, proposalType } = props;
	const currentBlock = useCurrentBlock();
	if (!onChainInfo) return null;

	const {
		cid,
		code,
		codec,
		delay,
		description,
		end,
		status,
		vote_threshold,
		method,
		post_id,
		ended_at,
		proposed_call,
		bond,
		curator,
		curator_deposit,
		deciding,
		decision_deposit_amount,
		submission_deposit_amount,
		deposit,
		enactment_after_block,
		enactment_at_block,
		ended_at_block,
		fee,
		hash,
		member_count,
		motion_method,
		origin,
		proposal_arguments,
		submitted_amount,
		reward,
		payee,
		statusHistory,
		version
	} = onChainInfo;
	const blockNumber = getBlockNumber(statusHistory);

	const formattedBlockToTime = (blockNo: number) => {
		if (!currentBlock) return;
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
					<h5 className='mb-5 text-base font-bold'>Metadata</h5>
					<ul className='flex list-none flex-col gap-y-2'>
						{submitted_amount && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 font-medium text-lightBlue'>Submitted</h6>
								<div className='col-span-4 overflow-hidden font-medium text-bodyBlue md:col-span-6'>
									{formatBnBalance(String(submitted_amount), { numberAfterComma: 2, withUnit: true }, network)}
								</div>
							</li>
						)}
						{origin && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 font-medium text-lightBlue'>Origin</h6>
								<div className='col-span-4 overflow-hidden font-medium text-bodyBlue md:col-span-6'>{origin.split(/(?=[A-Z])/).join(' ')}</div>
							</li>
						)}
						{enactment_after_block && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 font-medium text-lightBlue'>Enactment After</h6>
								<div className='col-span-4 overflow-hidden font-medium text-bodyBlue md:col-span-6'>
									{String(enactment_after_block).length < 8 ? (
										enactment_after_block
									) : (
										<div>
											<span>{formattedBlockToTime(Number(enactment_after_block))}</span>
											<a
												href={`${url}${enactment_after_block}`}
												target='_blank'
												rel='noreferrer'
												className='ml-3 text-pink_secondary'
											>
												#{enactment_after_block}
											</a>
										</div>
									)}
								</div>
							</li>
						)}
						{enactment_at_block && (
							<li className='grid grid-cols-6 gap-x-5 border-b py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 font-medium text-lightBlue'>Enactment At</h6>
								<div className='col-span-4 overflow-hidden font-medium text-bodyBlue md:col-span-6'>
									{String(enactment_at_block).length < 8 ? (
										enactment_at_block
									) : (
										<div>
											<span>{formattedBlockToTime(Number(enactment_at_block))}</span>
											<a
												href={`${url}${enactment_at_block}`}
												target='_blank'
												rel='noreferrer'
												className='ml-3 text-pink_secondary'
											>
												#{enactment_at_block}
											</a>
										</div>
									)}
								</div>
							</li>
						)}
						{deciding && deciding.since && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 font-medium text-lightBlue'>Deciding Since</h6>
								<div className='col-span-4 overflow-hidden font-medium text-bodyBlue md:col-span-6'>
									{`${deciding.since}`.length < 8 ? (
										deciding.since
									) : (
										<div>
											<span>{formattedBlockToTime(Number(deciding.since))}</span>
											<a
												href={`${url}${deciding.since}`}
												target='_blank'
												rel='noreferrer'
												className='ml-3 text-pink_secondary'
											>
												#{deciding.since}
											</a>
										</div>
									)}
								</div>
							</li>
						)}
						{deciding && deciding.confirming && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 font-medium text-lightBlue'>Confirm Started</h6>
								<div className='col-span-4 overflow-hidden font-medium text-bodyBlue md:col-span-6'>
									{`${deciding.confirming}`.length < 8 ? (
										deciding.confirming
									) : (
										<div>
											<span>{formattedBlockToTime(Number(deciding.confirming))}</span>
											<a
												href={`${url}${deciding.confirming}`}
												target='_blank'
												rel='noreferrer'
												className='ml-3 text-pink_secondary'
											>
												#{deciding.confirming}
											</a>
										</div>
									)}
								</div>
							</li>
						)}
						{decision_deposit_amount && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 font-medium text-lightBlue'>Decision Deposit</h6>
								<div className='col-span-4 overflow-hidden text-bodyBlue md:col-span-6'>
									{formatBnBalance(String(decision_deposit_amount), { numberAfterComma: 2, withUnit: true }, network)}
								</div>
							</li>
						)}
						{submission_deposit_amount && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 font-medium text-lightBlue'>Submission Deposit</h6>
								<div className='col-span-4 overflow-hidden text-bodyBlue md:col-span-6'>
									{formatBnBalance(String(submission_deposit_amount), { numberAfterComma: 2, withUnit: true }, network)}
								</div>
							</li>
						)}
						{ended_at_block && ended_at && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] pb-1.5 md:grid-cols-8'>
								{status === tipStatus.CLOSING ? (
									<>
										<h6 className='col-span-2 pt-1.5 font-medium text-lightBlue'>Closing</h6>
										<div className='col-span-4 overflow-hidden md:col-span-6'>
											<BlockCountdown endBlock={ended_at_block} />
										</div>
									</>
								) : status === tipStatus.CLOSED ? (
									<>
										<h6 className='col-span-2 pt-1.5 font-medium text-lightBlue'>Closed</h6>
										<div className='col-span-4 overflow-hidden font-medium text-bodyBlue md:col-span-6'>{dayjs.utc(ended_at).format('DD MMM YYYY, HH:mm:ss')}</div>
									</>
								) : (
									<>
										<h6 className='col-span-2 pt-1.5 font-medium text-lightBlue'>Status</h6>
										<div className='col-span-4 overflow-hidden font-medium text-bodyBlue md:col-span-6'>{status}</div>
									</>
								)}
							</li>
						)}
						{deposit && network && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 text-base font-medium text-lightBlue'>Deposit</h6>
								<div className='col-span-4 font-medium text-bodyBlue md:col-span-6'>
									{(typeof deposit === 'string' ? parseInt(deposit) : deposit) / Math.pow(10, chainProperties[network]?.tokenDecimals) +
										' ' +
										chainProperties[network]?.tokenSymbol}
								</div>
							</li>
						)}
						{method && method !== motion_method && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 font-medium text-lightBlue'>Method</h6>
								<div className='col-span-4 font-medium text-bodyBlue md:col-span-6'>{method}</div>
							</li>
						)}
						{end && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								{status === 'Started' ? (
									<>
										<h6 className='col-span-2 font-medium text-lightBlue'>End</h6>
										<div className='col-span-4 md:col-span-6'>
											<BlockCountdown
												className='text-bodyBlue'
												endBlock={end}
											/>
										</div>
									</>
								) : (
									<>
										<h6 className='col-span-2 font-medium text-lightBlue'>Ended</h6>
										<div className='col-span-4 font-medium text-bodyBlue md:col-span-6'>{dayjs.utc(ended_at).format('DD MMM YYYY, HH:mm:ss')}</div>
									</>
								)}
							</li>
						)}
						{(delay || delay === 0) && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 font-medium text-lightBlue'>Delay</h6>
								<div className='col-span-4 font-medium text-bodyBlue md:col-span-6'>
									<BlocksToTime blocks={delay} />
								</div>
							</li>
						)}
						{vote_threshold && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 font-medium text-lightBlue'>Vote threshold</h6>
								<div className='col-span-4 font-medium text-bodyBlue md:col-span-6'>{vote_threshold}</div>
							</li>
						)}
						{member_count && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 text-base font-medium text-lightBlue'>Member count</h6>
								<div className='col-span-4 overflow-hidden font-medium text-bodyBlue md:col-span-6'>{member_count}</div>
							</li>
						)}
						{hash && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 flex items-center text-base font-medium text-lightBlue'>Proposal Hash</h6>
								<div className='col-span-4 font-medium text-bodyBlue md:col-span-6'>{hash}</div>
							</li>
						)}
						{curator && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 font-medium text-lightBlue'>Curator</h6>
								<div className='col-span-4 overflow-hidden font-medium text-bodyBlue md:col-span-6'>
									<Address
										displayInline={true}
										address={curator}
									/>
								</div>
							</li>
						)}
						{reward && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 font-medium text-lightBlue'>Reward</h6>
								<div className='col-span-4 font-medium text-bodyBlue md:col-span-6'>
									{(typeof reward === 'string' ? parseInt(reward) : reward) / Math.pow(10, chainProperties[network]?.tokenDecimals) + ' ' + chainProperties[network]?.tokenSymbol}
								</div>
							</li>
						)}
						{fee && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 font-medium text-lightBlue'>Fee</h6>
								<div className='col-span-4 font-medium text-bodyBlue md:col-span-6'>
									{(typeof fee === 'string' ? parseInt(fee) : fee) / Math.pow(10, chainProperties[network]?.tokenDecimals) + ' ' + chainProperties[network]?.tokenSymbol}
								</div>
							</li>
						)}
						{curator_deposit && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 font-medium text-lightBlue'>Curator Deposit</h6>
								<div className='col-span-4 font-medium text-bodyBlue md:col-span-6'>
									{(typeof curator_deposit === 'string' ? parseInt(curator_deposit) : curator_deposit) / Math.pow(10, chainProperties[network]?.tokenDecimals) +
										' ' +
										chainProperties[network]?.tokenSymbol}
								</div>
							</li>
						)}
						{bond && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 font-medium text-lightBlue'>Bond</h6>
								<div className='col-span-4 font-medium text-bodyBlue md:col-span-6'>
									{(typeof bond === 'string' ? parseInt(bond) : bond) / Math.pow(10, chainProperties[network]?.tokenDecimals) + ' ' + chainProperties[network]?.tokenSymbol}
								</div>
							</li>
						)}
						{payee && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 font-medium text-lightBlue'>Payee</h6>
								<div className='col-span-4 overflow-hidden md:col-span-6'>
									<Address
										displayInline={true}
										address={payee}
									/>
								</div>
							</li>
						)}
						{motion_method && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 text-base font-medium text-lightBlue'>Motion&apos;s method</h6>
								<div className={`col-span-4 md:col-span-6 ${motion_method === 'reject_proposal' ? 'bold-red-text' : 'font-medium text-bodyBlue'}`}>{motion_method}</div>
							</li>
						)}
						{cid && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 text-base font-medium text-lightBlue'>IPFS</h6>
								<div className='col-span-4 font-medium text-bodyBlue md:col-span-6'>
									<Link
										href={`https://ipfs.io/ipfs/${cid}`}
										target='_blank'
									>{`ipfs.io/ipfs/${cid}`}</Link>
								</div>
							</li>
						)}
						{cid && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 text-base font-medium text-lightBlue'>CID</h6>
								<div className='col-span-4 font-medium text-bodyBlue md:col-span-6'>{cid}</div>
							</li>
						)}
						{code && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 flex items-center text-base font-medium text-lightBlue'>Code</h6>
								<div className='col-span-4 font-medium text-bodyBlue md:col-span-6'>{code}</div>
							</li>
						)}
						{codec && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 flex items-center text-base font-medium text-lightBlue'>Codec</h6>
								<div className='col-span-4 font-medium text-bodyBlue md:col-span-6'>{codec}</div>
							</li>
						)}
						{version && (
							<li className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] py-1.5 md:grid-cols-8'>
								<h6 className='col-span-2 flex items-center text-base font-medium text-lightBlue'>Version</h6>
								<div className='col-span-4 font-medium text-bodyBlue md:col-span-6'>{version}</div>
							</li>
						)}
					</ul>
					{description && network === 'polymesh' ? (
						<div className='mt-5 grid grid-cols-6 gap-x-5 md:grid-cols-8'>
							<h6 className='col-span-6 text-base font-medium text-lightBlue md:col-span-2'>Description</h6>
							<p className='col-span-6 font-medium leading-6 text-bodyBlue'>{description}</p>
						</div>
					) : null}
					{proposal_arguments && (
						<div className='mt-7'>
							<h5 className='mb-3 text-base font-bold'>Call Arguments</h5>
							{proposal_arguments?.description ? (
								<div className='mt-5 grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] md:grid-cols-8'>
									<h6 className='col-span-6 text-base font-medium text-lightBlue md:col-span-2'>Description</h6>
									<p className='col-span-6 font-medium leading-6 text-bodyBlue'>{proposal_arguments?.description}</p>
								</div>
							) : null}
							{proposal_arguments?.args ? (
								<div>
									<ArgumentsTableJSONView
										postArguments={proposal_arguments.args}
										showAccountArguments={true}
									/>
								</div>
							) : null}
						</div>
					)}
					{proposed_call ? (
						<div className='mt-5 flex flex-col gap-y-5'>
							<ProposalInfo
								method={method}
								proposed_call={proposed_call}
							/>
						</div>
					) : null}
					{description && network !== 'polymesh' ? (
						<div className='mt-5 grid grid-cols-6 gap-x-5 md:grid-cols-8'>
							<h6 className='col-span-6 text-base font-medium text-lightBlue md:col-span-2'>Description</h6>
							<p className='col-span-6 font-medium leading-6 text-bodyBlue'>{description}</p>
						</div>
					) : null}
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
			{proposed_call?.method !== method && (
				<div className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] md:grid-cols-8'>
					<h6 className='col-span-6 font-medium text-lightBlue md:col-span-2'>Method</h6>
					<p className='col-span-6 font-medium leading-6 text-bodyBlue'>{proposed_call.method}</p>
				</div>
			)}
			{proposed_call?.section && (
				<div className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] md:grid-cols-8'>
					<h6 className='col-span-6 font-medium text-lightBlue md:col-span-2'>Section</h6>
					<p className='col-span-6 font-medium leading-6 text-bodyBlue'>{proposed_call.section}</p>
				</div>
			)}
			{proposed_call?.description && (
				<div className='grid grid-cols-6 gap-x-5 border-0 border-b border-solid border-[#e5e7eb] md:grid-cols-8'>
					<h6 className='col-span-6 font-medium text-lightBlue md:col-span-2'>Description</h6>
					<p className='col-span-6 font-medium leading-6 text-bodyBlue'>{proposed_call.description}</p>
				</div>
			)}
			{proposed_call?.args ? (
				<div>
					<ArgumentsTableJSONView
						postArguments={proposed_call?.args}
						showAccountArguments={true}
					/>
				</div>
			) : null}
		</>
	);
};
