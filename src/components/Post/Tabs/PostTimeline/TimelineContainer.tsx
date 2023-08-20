// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from 'dayjs-init';
import Link from 'next/link';
import StatusTag from 'src/ui-components/StatusTag';
import React, { useState } from 'react';
import { getStatus } from '~src/components/Post/Comment/CommentsContainer';
import { useNetworkContext } from '~src/context';
import { getFirestoreProposalType, getSinglePostLinkFromProposalType } from '~src/global/proposalType';
import { getBlockLink } from '~src/util/subscanCheck';
import { ExportOutlined, PlusSquareOutlined, UpOutlined } from '@ant-design/icons';

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
	const [isCollapsed, setIsCollapsed] = useState(false);
	const { timeline } = props;
	const { network } = useNetworkContext();
	if (!timeline) return null;
	const { statuses, type } = timeline;

	if (statuses.length === 0) return null;
	const minHeight = statuses.length * 50;
	const StatusDiv = ({ status } : { status: string }) => {
		return (
			<div className='flex items-center absolute -top-3.5 justify-center'>
				<StatusTag colorInverted={false} status={status} type={type} />
			</div>
		);
	};

	const toggleCollapse = () => {
		setIsCollapsed(!isCollapsed);
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
												<a className='text-pink_primary font-medium' href={`${url}${block}`} target='_blank' rel="noreferrer">
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

	const Timeline = () => {
		return(
			<section>
				{
					statuses.sort(sortfunc).map(({ block, status, timestamp }) => {
						const blockDate = dayjs(timestamp);
						let color;
						if(status === 'DecisionDepositePlaced'){
							status = 'Decision deposite placed';
							color = 'FF67000';
						}
						else if(status === 'Executed' || status === 'Submitted'){
							color = '#5BC044';
						}
						else{
							color = '#407AFC';
						}

						return (
							<div key={status} className={'border-t border-black-300'} style={{ borderTop: '1px solid #D2D8E0' }}>
								<div className={'w-[680px]'}>
									<article className="py-[8px]">
										<div className="ml-[24px] flex items-center">
											<div className="flex items-center space-x-[12px]"> {/* Add flex-grow here */}
												<p className="text-xs text-sidebarBlue mb-0">
													{blockDate.format("Do MMM 'YY, h:mm a")}
												</p>
												<a className="font-medium" href={`${url}${block}`} target="_blank" rel="noreferrer">
													<ExportOutlined style={{ color: '#e5007a' }}/>
												</a>
											</div>
											<div className="text-right ml-auto">
												<p style={{ backgroundColor: color }} className={'text-white my-1 px-[15px] text-xs py-[5px] rounded-[50px] items-center'}>
													{status}
												</p>
											</div>
										</div>
									</article>
								</div>
							</div>
						);
					})
				}
			</section>
		);
	};

	return (
		<section className='flex my-12 mx-7'>
			<div className={`min-h-${minHeight} flex -mb-[2px] bg-pink_primary w-[2px] relative -ml-2`}>
				<Link href={`/${getSinglePostLinkFromProposalType(getFirestoreProposalType(type as any) as any)}/${type === 'Tip'? timeline.hash: timeline.index}`}>
					<p className='font-medium text-base leading-6 text-pink_primary whitespace-nowrap px-2 h-[33px] flex items-center justify-center absolute -left-[15px] -top-7'>
						<PlusSquareOutlined className="mr-3"/>
						<span className='font-semibold text-base'>{getStatus(String(type))}</span>
					</p>
				</Link>
				<span className="flex justify-end mb-[200]px ml-[665px] -mt-[33px]">
					<UpOutlined onClick={toggleCollapse}/>
				</span>
			</div>
			<div className={`${isCollapsed ? 'hidden' : ''} mt-3`}>
				{Timeline()}
			</div>
			<div className="flex md:hidden flex-1 overflow-x-scroll scroll-hidden cursor-ew-resize">
				{TimelineItems(true)}
			</div>
		</section>
	);
};
export default TimelineContainer;
