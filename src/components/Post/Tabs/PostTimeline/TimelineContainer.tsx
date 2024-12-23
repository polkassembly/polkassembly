// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { dayjs } from 'dayjs-init';
import Link from 'next/link';
import React, { useState } from 'react';
import { getStatus } from '~src/components/Post/Comment/CommentsContainer';
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
import StatusTag from '~src/ui-components/StatusTag';
import { useNetworkSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';

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
	const { resolvedTheme: theme } = useTheme();
	const { timeline, className } = props;
	const {
		postData: { postType }
	} = usePostDataContext();
	const PostType = postType.replace(/(^|_)([a-z])/g, (_, __, c) => c.toUpperCase()).replace(/s$/, '');
	let activeColor;
	PostType === timeline.type ? (activeColor = '#485F7D') : (activeColor = '#E5007A');
	const { network } = useNetworkSelector();
	if (!timeline) return null;
	const { statuses, type } = timeline;

	if (statuses?.length === 0) return null;
	const minHeight = statuses?.length * 50;

	const toggleCollapse = () => {
		setIsCollapsed(!isCollapsed);
	};

	let displayIconActive;
	let displayIconUnactive;
	switch (getStatus(type as string)) {
		case 'Referendum':
			displayIconActive = <DemocracyReferendaIcon className='-ml-[6px] mr-3 mt-2' />;
			displayIconUnactive = <DemocracyReferendaGreyIcon className='-ml-[6px] mr-3 mt-2' />;
			break;
		case 'Treasury Proposal':
			displayIconActive = <TreasuryProposalIcon className='-ml-[6px] mr-3 mt-2' />;
			displayIconUnactive = <TreasuryProposalGreyIcon className='-ml-[6px] mr-3 mt-2' />;
			break;
		case 'Motion':
			displayIconActive = <MotionIcon className='-ml-[6px] mr-3 mt-2' />;
			displayIconUnactive = <MotionIconGrey className='-ml-[6px] mr-3 mt-2' />;
			break;
		case 'Tech Committee Proposal':
			displayIconActive = <TechCommProposalIcon className='-ml-[6px] mr-3 mt-2' />;
			displayIconUnactive = <TechCommProposalIconGrey className='-ml-[6px] mr-3 mt-2' />;
			break;
		case 'Democracy Proposal':
			displayIconActive = <DemocracyProposalIcon className='-ml-[6px] mr-3 mt-2' />;
			displayIconUnactive = <DemocracyProposalIconGrey className='-ml-[6px] mr-3 mt-2' />;
			break;
		case 'Child Bounty':
			displayIconActive = <ChildBountyIcon className='-ml-[6px] mr-3 mt-2' />;
			displayIconUnactive = <ChildBountyIconGrey className='-ml-[6px] mr-3 mt-2' />;
			break;
		default:
			displayIconActive = <DiscussionIcon className='-ml-[6px] mr-3 mt-2' />;
			displayIconUnactive = <DiscussionIconGrey className='-ml-[6px] mr-3 mt-2' />;
			break;
	}
	const url = getBlockLink(network);

	const StatusDiv = ({ status }: { status: string }) => {
		return (
			<div className='status-tag my-1 items-center rounded-[50px] px-[15px] py-[5px] text-xs text-white'>
				<StatusTag
					theme={theme}
					className='max-w-[86px] overflow-hidden text-ellipsis text-white md:max-w-full'
					colorInverted={false}
					status={status}
					type={type}
				/>
			</div>
		);
	};

	const Timeline = () => {
		return (
			<section className={className}>
				{statuses?.sort(sortfunc).map(({ block, status, timestamp }, index) => {
					const blockDate = dayjs(timestamp);
					return (
						<div
							key={status}
							className={'border-black-300 border-t'}
							style={index === 0 ? { borderTop: 'none' } : { borderTop: '1px solid #D2D8E0' }}
						>
							<div className='content-container'>
								<article className='py-[8px]'>
									<div className='flex items-center'>
										<div className='flex items-center'>
											<p className='info-container mb-0 whitespace-nowrap text-xs font-normal text-sidebarBlue dark:text-white'>{blockDate.format("Do MMM 'YY, h:mm a")}</p>
											{type !== 'Discussions' && (
												<a
													className='font-medium'
													href={`${url}${block}`}
													target='_blank'
													rel='noreferrer'
												>
													<ExportOutlined
														className='-mb-[2px]'
														style={{ color: '#e5007a' }}
													/>
												</a>
											)}
										</div>
										<div className='export-link text-right'>
											<StatusDiv status={status} />
										</div>
									</div>
								</article>
							</div>
						</div>
					);
				})}
			</section>
		);
	};
	return (
		<section className={`${className}`}>
			<div className='timeline-container my-12 flex'>
				<div
					className={`${isCollapsed ? 'min-h-[40px]' : `min-h-${minHeight}`} relative -mb-[2px] -ml-2 mt-[16px] w-[2px]`}
					style={{ backgroundColor: activeColor }}
				>
					<Link href={`/${getSinglePostLinkFromProposalType(getFirestoreProposalType(type as any) as any)}/${type === 'Tip' ? timeline.hash : timeline.index}`}>
						<p
							className='-left-[5px] -top-7 -mt-[40px] flex h-[33px] w-[250px] flex-row gap-1 whitespace-nowrap text-base font-normal leading-6'
							style={{ color: activeColor, fontWeight: '500', marginLeft: '-4px' }}
						>
							{PostType === timeline.type ? displayIconUnactive : displayIconActive}
							<span className='mt-2 text-base font-medium'>{getStatus(type as string)}</span>
						</p>
					</Link>
					<p
						className='timeline-dropdown'
						style={{ backgroundColor: activeColor, marginTop: '-44px' }}
					>
						{isCollapsed ? (
							<div className='arrow-container flex w-[200px] gap-3'>
								<p className='status-update -mt-[5px]'>
									<StatusDiv status={timeline?.statuses?.[statuses?.length || 1 - 1]?.status} />
								</p>
								<DownArrow
									onClick={toggleCollapse}
									className='mt-[12px]'
								/>
							</div>
						) : (
							<UpArrow
								onClick={toggleCollapse}
								className='mt-[7px]'
							/>
						)}
					</p>
				</div>
				<span
					className={'round-icon absolute -bottom-1 -left-1 -mb-[5px] h-[10px] w-[10px] rounded-full'}
					style={{ backgroundColor: activeColor }}
				></span>
				<div className={`${isCollapsed ? 'hidden' : ''} ml-[24px] mt-3`}>{Timeline()}</div>
			</div>
		</section>
	);
};
export default styled(TimelineContainer)`
	.content-container {
		width: 600px;
	}

	.export-link {
		margin-left: auto;
	}

	.timeline-container {
		margin: 0 32px;
	}

	.timeline-dropdown {
		margin-left: 604px;
	}

	.info-container {
		min-width: 140px;
	}

	.round-icon {
		margin-left: 60px;
	}

	.status-tag {
		margin-right: -16px;
	}

	.arrow-container {
		margin-left: -105px;
	}

	.status-update {
		width: 98px;
	}

	@media (max-width: 1500px) and (min-width: 1320px) {
		.content-container {
			width: 500px;
		}

		.timeline-dropdown {
			margin-left: 516px;
		}
	}
	@media (max-width: 1320px) and (min-width: 1280px) {
		.content-container {
			width: 500px;
		}

		.timeline-dropdown {
			margin-left: 504px;
		}
	}

	@media (min-width: 1100px) and (max-width: 1280px) {
		.content-container {
			width: 700px;
		}

		.timeline-container {
			margin: 0 5px;
		}

		.timeline-dropdown {
			margin-left: 700px;
		}

		.round-icon {
			margin-left: 34px;
		}
	}

	@media (min-width: 925px) and (max-width: 1024px) {
		.content-container {
			width: 725px;
		}

		.export-link {
			margin-right: 10px;
		}

		.timeline-container {
			margin: 0 70px;
		}

		.timeline-dropdown {
			margin-left: 720px;
		}

		.round-icon {
			margin-left: 98px;
		}
	}

	@media (min-width: 700px) and (max-width: 800px) {
		.content-container {
			width: 550px;
		}

		.timeline-container {
			margin: 0;
		}

		.timeline-dropdown {
			margin-left: 560px;
		}

		.round-icon {
			margin-left: 28px;
		}
	}

	@media (min-width: 600px) and (max-width: 700px) {
		.content-container {
			width: 478px;
		}

		.timeline-container {
			margin: 0;
		}

		.timeline-dropdown {
			margin-left: 485px;
		}

		.round-icon {
			margin-left: 28px;
		}
	}

	@media (min-width: 500px) and (max-width: 600px) {
		.content-container {
			width: 410px;
		}

		.timeline-container {
			margin: 0;
		}

		.timeline-dropdown {
			margin-left: 420px;
		}

		.round-icon {
			margin-left: 28px;
		}
	}

	@media (max-width: 500px) and (min-width: 400px) {
		.content-container {
			width: 293px;
		}

		.export-link {
			margin-right: -2px;
		}

		.timeline-container {
			margin: 0;
		}

		.timeline-dropdown {
			margin-left: 300px;
		}

		.round-icon {
			margin-left: 28px;
		}

		.status-update {
			margin-left: -110px;
		}

		.arrow-container {
			margin-left: 6px;
		}
	}
	@media (max-width: 400px) and (min-width: 360px) {
		.content-container {
			width: 248px;
		}

		.timeline-container {
			margin: 0 5px;
		}

		.round-icon {
			margin-left: 33px;
		}

		.timeline-dropdown {
			margin-left: 263px;
		}
	}

	@media (max-width: 360px) and (min-width: 320px) {
		.content-container {
			width: 248px;
		}

		.timeline-container {
			margin: 0 -27px;
		}

		.round-icon {
			margin-left: 2px;
		}

		.timeline-dropdown {
			margin-left: 256px;
		}
	}
`;
