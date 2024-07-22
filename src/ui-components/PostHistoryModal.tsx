// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Modal, Timeline, TimelineItemProps } from 'antd';
import { IPostHistory } from '~src/types';
import styled from 'styled-components';
import NameLabel from './NameLabel';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import UserAvatar from './UserAvatar';
import { noTitle } from '~src/global/noTitle';
import { poppins } from 'pages/_app';
// import sanitizeMarkdown from '~src/util/sanitizeMarkdown';
import Markdown from './Markdown';
import { CloseIcon } from './CustomIcons';
import { GenerateDiffHtml, removeSymbols } from '~src/util/htmlDiff';
import { diffChars } from 'diff';
import { useTheme } from 'next-themes';
interface Props {
	className?: string;
	open: boolean;
	setOpen: (pre: boolean) => void;
	history: IPostHistory[];
	defaultAddress?: string | null;
	username: string;
	user_id?: number | null | undefined;
}
interface IHistoryData extends IPostHistory {
	expandedContent?: boolean;
	expanded?: boolean;
}
enum EExpandType {
	Expanded = 'expanded',
	ExpandedContent = 'expandedContent'
}

const PostHistoryModal = ({ className, open, setOpen, history, defaultAddress, username, user_id }: Props) => {
	const [historyData, setHistoryData] = useState<IHistoryData[]>([]);
	const { resolvedTheme: theme } = useTheme();

	const items: TimelineItemProps[] = historyData?.map((item, index) => {
		const date = new Date(item?.created_at);
		const title = item?.title || noTitle;
		const currentContent = item && item.content;
		const previousContent = index < historyData.length - 1 ? historyData[index + 1]?.content : null;
		const previousContentString = previousContent ? removeSymbols(previousContent) : '';
		const currentContentString = removeSymbols(currentContent);
		const difference = previousContent ? GenerateDiffHtml(previousContentString, currentContentString) : currentContent;

		// const difference = historyData[index+1] && historyData[index+1]?.content && item?.expanded ? diffChars(sanitizeMarkdown(historyData[index+1]?.content),  sanitizeMarkdown(item?.content)) : [];

		return {
			children: !item?.expanded ? (
				<div className={'-mt-1 ml-3 flex h-[50px] flex-col gap-2 text-sm font-medium tracking-[0.01em] text-[#334D6E] dark:text-blue-dark-medium max-sm:ml-0 max-sm:w-full'}>
					Edited on {getRelativeCreatedAt(date)}
					<div
						className='-mt-2 flex cursor-pointer justify-start text-sm text-pink_primary'
						onClick={() => handleExpand(index, EExpandType.Expanded)}
					>
						<span className='text-xs'>See Details</span>
					</div>
				</div>
			) : (
				<div
					className={`ml-3 mt-1 rounded-[4px] border-[0.5px] border-solid border-section-light-container bg-white px-3 py-3 dark:border-[#3B444F] dark:bg-section-dark-overlay max-sm:ml-0 max-sm:w-full ${
						item?.expanded && 'active-timeline'
					}`}
				>
					<div className='flex items-center max-sm:flex-col max-sm:items-start max-sm:justify-start  max-sm:gap-2'>
						<div className='flex items-center max-sm:justify-start'>
							<span className='mr-1 text-xs text-[#90A0B7]'>By:</span>
							<NameLabel
								defaultAddress={defaultAddress}
								username={username}
								usernameClassName='text-xs text-[#334D6E]'
							/>
						</div>
						<div className='flex items-center'>
							<div className='ml-1 mr-2  mt-[1px] flex h-[3.5px] w-[3px] items-center justify-center rounded-[50%] bg-[#A0A6AE]' />
							<div className='flex items-center text-xs'>
								<span className='text-xs text-navBlue'>{getRelativeCreatedAt(date)}</span>
							</div>
						</div>
					</div>
					<div className='mt-1 text-[16px] font-medium text-[#334D6E] dark:text-blue-dark-medium'>
						{historyData[index + 1] ? (
							item?.title ? (
								<div>
									{diffChars(historyData[index + 1]?.title, item?.title)?.map((text, idx) => (
										<span
											key={idx}
											className={`${text.added ? (theme === 'light' ? 'added' : 'added-dark') : ''} ${text.removed ? (theme === 'light' ? 'removed' : 'removed-dark') : ''}`}
										>
											{text.value}
										</span>
									))}
								</div>
							) : (
								title
							)
						) : (
							title
						)}
					</div>
					<div className='mt-1 pr-2 text-sm font-normal leading-6 tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high'>
						{/* {historyData[index+1] ? <div>{difference?.map((text, idx) => <span key={idx} className={`${text?.removed && 'bg-[#fff3b3]'} ${text?.added && 'bg-[#fff3b3]'}`}>{text.value}</span>)}</div> : item?.content} */}
						<Markdown
							className='text-sm'
							md={!item?.expandedContent && item?.content.length > 100 ? `${difference.slice(0, 100)}...` : difference}
						/>
					</div>
					{item?.content.length > 100 && (
						<span
							onClick={() => handleExpand(index, EExpandType.ExpandedContent)}
							className='mt-1 cursor-pointer text-xs font-medium text-pink_primary'
						>
							{item?.expandedContent ? 'Show less' : 'Show more'}
						</span>
					)}
				</div>
			),
			dot: username && (
				<UserAvatar
					className='-mb-1 -mt-1 hidden flex-none sm:inline-block'
					username={username}
					size='large'
					id={user_id || 0}
				/>
			),
			key: index
		};
	});

	const handleExpand = (index: number, expandedType: EExpandType) => {
		const data = historyData.map((item, idx) => {
			if (idx === index) {
				if (expandedType === EExpandType.Expanded) {
					if (item?.expanded) {
						return { ...item, expanded: !item?.expanded, expandedContent: false };
					}
					return { ...item, expanded: !item?.expanded };
				} else if (expandedType === EExpandType.ExpandedContent) {
					return { ...item, expandedContent: !item?.expandedContent };
				}
			}

			return item;
		});
		setHistoryData(data);
	};

	useEffect(() => {
		setHistoryData(
			history.map((item, index) => {
				return index === 0 ? { ...item, expanded: true } : item;
			})
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	useEffect(() => {
		if (!historyData || !historyData.length) return;

		Array.from(document.querySelectorAll('.post-history-timeline .ant-timeline-item-tail'))?.map((element, index) =>
			element.addEventListener('click', () => handleExpand(index, EExpandType.Expanded))
		);

		return () => {
			Array.from(document.querySelectorAll('.post-history-timeline .ant-timeline-item-tail'))?.map((element, index) =>
				element.removeEventListener('click', () => handleExpand(index, EExpandType.Expanded))
			);
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [historyData]);

	return (
		<Modal
			open={open}
			onCancel={() => setOpen(false)}
			wrapClassName={`${className} dark:bg-modalOverlayDark`}
			className={`closeIcon shadow-[0px 8px 18px rgba(0, 0, 0, 0.06)] w-[600px] max-sm:w-full ${poppins.variable} ${poppins.className} dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			footer={false}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			title={<label className='-mt-2 pr-3 text-[20px] font-semibold text-[#334D6E] dark:text-white'>Proposal Edit History</label>}
		>
			<div className='post-history-timeline -mb-6 mt-9 flex flex-col px-4'>
				<Timeline items={items} />
			</div>
		</Modal>
	);
};
export default styled(PostHistoryModal)`
	.added {
		background-color: var(--ayeGreenColor);
		margin-right: 1.5px;
		color: white;
	}

	.removed {
		background-color: var(--nayRedColor);
		text-decoration: line-through;
		color: white;
	}
	.added-dark {
		background-color: var(--ayeDarkGreenColor);
		margin-right: 1.5px;
		color: white;
	}

	.removed-dark {
		background-color: var(--nayDarkRedColor);
		text-decoration: line-through;
		color: white;
	}
	.closeIcon .ant-modal-close-x {
		margin-top: 4px;
	}
	.post-history-timeline .ant-timeline .ant-timeline-item-tail {
		border-inline-start: 2px solid rgba(5, 5, 5, 0) !important;
		background-image: linear-gradient(rgba(144, 160, 183) 33%, rgba(255, 255, 255, 0) 0%) !important;
		background-position: right !important;
		background-size: 1.5px 7px !important;
		background-repeat: repeat-y !important ;
		cursor: pointer !important;
	}
	.post-history-timeline .ant-timeline .ant-timeline-item:has(.active-timeline) {
		.ant-timeline-item-tail {
			background-image: linear-gradient(rgba(229, 0, 122) 33%, rgba(255, 255, 255, 0) 20%) !important;
			background-position: right !important;
			background-size: 1.5px 7px !important;
			background-repeat: repeat-y !important ;
			cursor: pointer !important;
		}
	}
	@media screen and (max-width: 640px) {
		.post-history-timeline .ant-timeline .ant-timeline-item-tail {
			border: none !important;
		}
		.post-history-timeline .ant-timeline .ant-timeline-item-content {
			margin-left: 0px !important;
		}
	}
	.post-history-timeline .ant-timeline-item {
		padding-bottom: 30px !important;
	}
	.post-history-timeline .ant-timeline-item-content {
		inset-block-start: -8px !important;
	}
	.post-history-timeline .ant-timeline .ant-timeline-item-head-custom {
		inset-block-start: 8px !important;
	}
	.ant-modal .ant-modal-header {
		background: transparent !important;
	}
	.ant-timeline .ant-timeline-item-head {
		background-color: transparent !important;
	}
`;
