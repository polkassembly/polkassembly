// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from 'dayjs-init';
import Link from 'next/link';
import React, { useState } from 'react';
import { getStatus } from '~src/components/Post/Comment/CommentsContainer';
import { useNetworkContext } from '~src/context';
import { getFirestoreProposalType, getSinglePostLinkFromProposalType } from '~src/global/proposalType';
import { getBlockLink } from '~src/util/subscanCheck';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import DemocracyReferendaIcon from '~assets/icons/Democracy-Referenda.svg';
import DemocracyReferendaGreyIcon from '~assets/icons/Democracy-Referenda-grey.svg';
import ExportOutlined from '~assets/icons/learn-more-icon.svg';
import { usePostDataContext } from '~src/context';

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
	const { postData: { postType } } = usePostDataContext();
	const PostType = postType.replace(/(^|_)([a-z])/g, (_, __, c) => c.toUpperCase()).replace(/s$/, '');
	let activeColor;
	PostType === timeline.type ?  activeColor = '#485F7D' : activeColor = '#E5007A';
	const { network } = useNetworkContext();
	if (!timeline) return null;
	const { statuses, type } = timeline;

	if (statuses.length === 0) return null;
	const minHeight = statuses.length * 50;

	const toggleCollapse = () => {
		setIsCollapsed(!isCollapsed);
	};

	const url = getBlockLink(network);

	const Timeline = () => {
		return(
			<section>
				{
					statuses.sort(sortfunc).map(({ block, status, timestamp }, index) => {
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
							<div key={status} className={'border-t border-black-300'} style={index === 0 ? { borderTop: 'none' } : { borderTop: '1px solid #D2D8E0' }}>
								<div className='content-container'>
									<article className="py-[8px]">
										<div className="flex items-center">
											<div className="flex items-center space-x-[12px]">
												<p className="text-xs text-sidebarBlue whitespace-nowrap mb-0">
													{blockDate.format("Do MMM 'YY, h:mm a")}
												</p>
												<a className="font-medium" href={`${url}${block}`} target="_blank" rel="noreferrer">
													<ExportOutlined className='-mb-[2px]' style={{ color: '#e5007a' }}/>
												</a>
											</div>
											<div className="text-right export-link">
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
		<section className='flex my-16 timeline-container'>
			<div className={`min-h-${minHeight} -mb-[2px] mt-[16px] w-[2px] relative -ml-2`} style={{ backgroundColor: activeColor }}>
				<Link href={`/${getSinglePostLinkFromProposalType(getFirestoreProposalType(type as any) as any)}/${type === 'Tip'? timeline.hash: timeline.index}`}>
					<p className='flex flex-row gap-1 w-[250px] -mt-[40px] font-normal text-base leading-6 whitespace-nowrap h-[33px] -left-[5px] -top-7' style={{ color: activeColor, fontWeight: '500', marginLeft: '-4px' }}>
						{PostType===timeline.type ? <DemocracyReferendaGreyIcon className="-ml-[6px] mr-3 mt-2"/> : <DemocracyReferendaIcon className="-ml-[6px] mr-3 mt-2"/>}
						<span className='mt-2 font-semibold text-base'>{getStatus(String(type))}</span>
					</p>
					<p className='timeline-dropdown' style={{ backgroundColor: activeColor, marginTop: '-44px' }}>
						{isCollapsed ? (
							<DownOutlined onClick={toggleCollapse} />
						) : (
							<UpOutlined onClick={toggleCollapse} />
						)}
					</p>
					<span className={`${isCollapsed ? 'hidden' : ''} -mb-[5px] rounded-full absolute -bottom-1 -left-1 w-[10px] h-[10px]` } style={{ backgroundColor: activeColor }}></span>
				</Link>
			</div>
			<div className={`${isCollapsed ? 'hidden' : ''} mt-3 ml-[24px]`}>
				{Timeline()}
			</div>
		</section>
	);
};
export default TimelineContainer;
