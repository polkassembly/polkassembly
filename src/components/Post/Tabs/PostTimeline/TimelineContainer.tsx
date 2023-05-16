// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from 'dayjs-init';
import Link from 'next/link';
import * as React from 'react';
import StatusTag from 'src/ui-components/StatusTag';

import { getStatus } from '~src/components/Post/Comment/CommentsContainer';
import { useNetworkContext } from '~src/context';
import { getFirestoreProposalType, getSinglePostLinkFromProposalType } from '~src/global/proposalType';
import { getBlockLink } from '~src/util/subscanCheck';

interface BlockStatus {
	block: number;
	status: string;
	timestamp: string;
}

interface ITimelineContainerProps {
	className?: string;
	timeline: {
		index: number | string;
		hash: string;
		statuses: BlockStatus[];
		type?: string;
	}
}

function sortfunc(a: BlockStatus, b: BlockStatus) {
	return a.block - b.block;
}

const TimelineContainer: React.FC<ITimelineContainerProps> = (props) => {
	const { timeline } = props;
	const { network } = useNetworkContext();
	if (!timeline) return null;
	const { statuses, type } = timeline;

	if (statuses.length === 0) return null;

	const StatusDiv = ({ status } : { status: string }) => {
		return (
			<div className='flex items-center absolute -top-3.5 justify-center'>
				<StatusTag colorInverted={false} status={status} type={type} />
			</div>
		);
	};

	const url = getBlockLink(network);

	const TimelineItems = (isMobile:boolean) => {

		return (
			<section className={`flex-1 flex ${isMobile? 'flex-col items-start gap-y-20 py-20': 'items-center'}`}>
				{
					statuses.sort(sortfunc).map(({ block, status, timestamp }, index) => {
						const blockDate = dayjs(timestamp);
						return (
							<div key={status} className={`flex flex-1 w-full items-center ${!isMobile? (index === 0? 'max-w-[250px]': 'max-w-[225px]'): 'max-w-[250px]'}`}>
								<div className={`flex-1 h-[1px] bg-navBlue ${!isMobile? (index === 0? 'min-w-[50px]': 'min-w-[25px]'): 'min-w-[12.5px]'}`}></div>
								<article className='flex flex-col items-center gap-y-2 font-normal text-sidebarBlue px-[14px] pb-4 pt-8 rounded-lg border border-solid border-navBlue relative bg-comment_bg w-[200px]'>
									<StatusDiv status={status} />
									{
										block?
											<p className='flex items-center gap-x-1 m-0'>
												Block:
												<a className='text-pink_primary font-medium' href={`${url}/${block}`} target='_blank' rel="noreferrer">
											#{`${block} `}
												</a>
											</p>
											: null
									}
									{
										timestamp && blockDate ?
											(
												<p className='flex items-center m-0'>{blockDate.format('Do MMM \'YY, h:mm a')}</p>
											)
											: null
									}
								</article>
							</div>
						);
					})
				}
			</section>
		);
	};
	return (
		<section className='flex'>
			<div className='min-h-[300px] bg-pink_primary w-[2px] relative'>
				<Link href={`/${getSinglePostLinkFromProposalType(getFirestoreProposalType(type as any) as any)}/${type === 'Tip'? timeline.hash: timeline.index}`}>
					<span className='bg-pink_primary rounded-2xl font-medium text-base text-white whitespace-nowrap min-w-[100px] px-5 h-[33px] flex items-center justify-center absolute -left-5 -top-5 shadow-lg shadow-grey_secondary border-.15 border-solid border-pink_primary transition-all ease-in-out  hover:bg-white hover:text-pink_primary'>
						{getStatus(String(type))}
					</span>
				</Link>
				<span className='bg-pink_primary rounded-full absolute -bottom-1 -left-1 w-[10px] h-[10px]'>
				</span>
			</div>
			<div className="hidden md:flex flex-1 overflow-x-scroll scroll-hidden cursor-ew-resize">
				{TimelineItems(false)}
			</div>
			<div className="flex md:hidden flex-1 overflow-x-scroll scroll-hidden cursor-ew-resize">
				{TimelineItems(true)}
			</div>
		</section>
	);
};

export default TimelineContainer;
