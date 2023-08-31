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
import DemocracyReferendaIcon from '~assets/icons/Democracy-Referenda.svg';
import DemocracyReferendaGreyIcon from '~assets/icons/Democracy-Referenda-grey.svg';
import TreasuryProposalGreyIcon from '~assets/icons/treasury-proposals-icon-grey.svg';
import TreasuryProposalIcon from '~assets/icons/treasury-proposals-icon.svg';
import DiscussionIcon from '~assets/icons/discussion-icon-selected.svg';
import DiscussionIconGrey from '~assets/icons/discussion-icon-unselected.svg';
import MotionIconGrey from '~assets/icons/motions-icon-unselected.svg';
import MotionIcon from '~assets/icons/motions-icon-selected.svg';
import TechCommProposalIcon from '~assets/sidebar/tech-comm-proposals-icon-selected.svg';
import TechCommProposalIconGrey from '~assets/sidebar/tech-comm-proposals-icon-unselected.svg';
import DemocracyProposalIconGrey from '~assets/sidebar/democracy-proposal-icon-unselected.svg';
import DemocracyProposalIcon from '~assets/sidebar/democracy-proposal-icon-selected.svg';
import ChildBountyIcon from '~assets/sidebar/treasury-child-bounties-icon-selected.svg';
import ChildBountyIconGrey from '~assets/sidebar/treasury-child-bounties-icon-unselected.svg';
import ExportOutlined from '~assets/icons/learn-more-icon.svg';
import { usePostDataContext } from '~src/context';
import DownArrow from '~assets/icons/down-icon.svg';
import UpArrow from '~assets/icons/up-arrow.svg';
import styled from 'styled-components';

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
	};
}

function sortfunc(a: BlockStatus, b: BlockStatus) {
	return a.block - b.block;
}

const TimelineContainer: React.FC<ITimelineContainerProps> = (props) => {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const { timeline, className } = props;
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

	let displayIconActive;
	let displayIconUnactive;
	switch (getStatus(type as string)) {
	case 'Referendum':
		displayIconActive = <DemocracyReferendaIcon className="-ml-[6px] mr-3 mt-2"/>;
		displayIconUnactive = <DemocracyReferendaGreyIcon className="-ml-[6px] mr-3 mt-2" />;
		break;
	case 'Treasury Proposal':
		displayIconActive = <TreasuryProposalIcon className="-ml-[6px] mr-3 mt-2"/>;
		displayIconUnactive = <TreasuryProposalGreyIcon className="-ml-[6px] mr-3 mt-2" />;
		break;
	case 'Motion':
		displayIconActive = <MotionIcon className="-ml-[6px] mr-3 mt-2"/>;
		displayIconUnactive = <MotionIconGrey className="-ml-[6px] mr-3 mt-2" />;
		break;
	case 'Tech Committee Proposal':
		displayIconActive = <TechCommProposalIcon className="-ml-[6px] mr-3 mt-2"/>;
		displayIconUnactive = <TechCommProposalIconGrey className="-ml-[6px] mr-3 mt-2" />;
		break;
	case 'Democracy Proposal':
		displayIconActive = <DemocracyProposalIcon className="-ml-[6px] mr-3 mt-2"/>;
		displayIconUnactive = <DemocracyProposalIconGrey className="-ml-[6px] mr-3 mt-2" />;
		break;
	case 'Child Bounty':
		displayIconActive = <ChildBountyIcon className="-ml-[6px] mr-3 mt-2"/>;
		displayIconUnactive = <ChildBountyIconGrey className="-ml-[6px] mr-3 mt-2" />;
		break;
	default:
		displayIconActive = <DiscussionIcon className="-ml-[6px] mr-3 mt-2"/>;
		displayIconUnactive = <DiscussionIconGrey className="-ml-[6px] mr-3 mt-2" />;
		break;
	}
	const url = getBlockLink(network);

	const Timeline = () => {
		return(
			<section className={className}>
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
											<div className="flex items-center">
												<p className="text-xs text-sidebarBlue font-normal whitespace-nowrap mb-0 info-container">
													{blockDate.format("Do MMM 'YY, h:mm a")}
												</p>
												<a className="font-medium" href={`${url}${block}`} target="_blank" rel="noreferrer">
													<ExportOutlined className='-mb-[2px]' style={{ color: '#e5007a' }}/>
												</a>
											</div>
											<div className="text-right export-link">
												<p style={{ backgroundColor: color }} className={'text-ellipsis overflow-hidden text-white max-w-[86px] md:max-w-full my-1 px-[15px] text-xs py-[5px] rounded-[50px] items-center'}>
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
		<section className={`${className}`}>
			<div className="flex my-12 timeline-container">
				<div className={`${isCollapsed ? 'min-h-[40px]' : `min-h-${minHeight}`} -mb-[2px] mt-[16px] w-[2px] relative -ml-2`} style={{ backgroundColor: activeColor }}>
					<Link href={`/${getSinglePostLinkFromProposalType(getFirestoreProposalType(type as any) as any)}/${type === 'Tip'? timeline.hash: timeline.index}`}>
						<p className='flex flex-row gap-1 w-[250px] -mt-[40px] font-normal text-base leading-6 whitespace-nowrap h-[33px] -left-[5px] -top-7' style={{ color: activeColor, fontWeight: '500', marginLeft: '-4px' }}>
							{PostType===timeline.type ? displayIconUnactive  : displayIconActive}
							<span className='bg-pink_primary rounded-2xl font-medium text-base text-white whitespace-nowrap min-w-[100px] px-5 h-[33px] flex items-center justify-center absolute -left-5 -top-5 shadow-lg shadow-grey_secondary border-.15 border-solid border-pink_primary transition-all ease-in-out  hover:bg-white dark:bg-section-dark-overlay hover:text-pink_primary'>{getStatus(type as string)}</span>
						</p>
					</Link>
					<p className='timeline-dropdown' style={{ backgroundColor: activeColor, marginTop: '-44px' }}>
						{isCollapsed ? (
							<div className="flex w-[200px] gap-3 arrow-container">
								<p className='bg-[#5BC044] text-white my-1 text-center px-[15px] w-[100px] text-xs py-[5px] rounded-[50px] items-center status-update'>{timeline?.statuses[statuses.length - 1].status}</p>
								<DownArrow onClick={toggleCollapse} className="mt-[12px]"/>
							</div>
						) : (
							<UpArrow onClick={toggleCollapse} className="mt-[7px]"/>
						)}
					</p>
				</div>
				<span className={'-mb-[5px] round-icon rounded-full absolute -bottom-1 -left-1 w-[10px] h-[10px]' } style={{ backgroundColor: activeColor }}></span>
				<div className={`${isCollapsed ? 'hidden' : ''} mt-3 ml-[24px]`}>
					{Timeline()}
				</div>
			</div>
		</section>
	);
};
export default (styled(TimelineContainer)`
	.content-container {
		width: 660px;
	}
	
	.export-link{
		margin-left: auto;
	}
	
	.timeline-container {
		margin: 0 32px;
	}
	
	.timeline-dropdown {
		margin-left: 664px;;
	}
	
	.info-container{
		min-width: 140px;
	}
	
	.round-icon{
		margin-left: 60px;
	}
	
	.arrow-container{
		margin-left: -107px;
	}
	
	@media (min-width: 600px) and (max-width: 800px) {
		.content-container {
		width: 213px;
		}
	
		.export-link {
		margin-left: 335px;
		margin-right: auto;
		}
	
		.timeline-container {
		margin: 0;
		}
	
		.timeline-dropdown {
		margin-left: 578px;
		}
	}
	
	@media (max-width: 600px) {
		.content-container {
		width: 213px;
		}
	
		.export-link {
		margin-left: 47px;
		margin-right: auto;
		}
	
		.timeline-container {
		margin: 0;
		}
	
		.timeline-dropdown {
		margin-left: 300px;
		}
	
		.round-icon{
		margin-left: 28px;
		}
	
		.arrow-container{
		margin-left: 8px;
		}
	
		.status-update{
		display:none;
		}
	}
`);