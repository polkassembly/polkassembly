// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Collapse } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import ImageIcon from '~src/ui-components/ImageIcon';
import { usePostDataContext } from '~src/context';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Markdown from '~src/ui-components/Markdown';
import { useTheme } from 'next-themes';
const { Panel } = Collapse;

interface Props {
	className?: string;
	theme?: string;
}

const PostProgressReport = ({ className }: Props) => {
	const { postData } = usePostDataContext();
	const router = useRouter();
	const { resolvedTheme: theme } = useTheme();

	const getRelativeTime = (timestamp: string): string => {
		const postDate = new Date(timestamp);
		const currentDate = new Date();

		if (isNaN(postDate.getTime()) || isNaN(currentDate.getTime())) return '';

		const diffMs = currentDate.getTime() - postDate.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		const diffWeeks = Math.floor(diffDays / 7);
		const diffMonths = Math.floor(diffDays / 30);
		const diffYears = Math.floor(diffDays / 365);

		if (diffYears >= 1) {
			return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
		} else if (diffMonths >= 1) {
			return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
		} else if (diffWeeks >= 1) {
			return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
		} else if (diffDays >= 1) {
			return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
		} else {
			return 'today';
		}
	};

	return (
		<div className={`${className} mt-2 rounded-lg border border-solid border-[#796EEC]`}>
			<Collapse
				size='large'
				className={'h-full bg-[#F0EEFE] dark:bg-transparent'}
				expandIconPosition='end'
				expandIcon={({ isActive }) => {
					return isActive ? <ExpandIcon /> : <CollapseIcon />;
				}}
			>
				<Panel
					header={
						<div className='channel-header -ml-3 flex items-center'>
							<ImageIcon
								src='/assets/icons/books-icon.svg'
								alt='progress-file-icon'
								className='mr-1 mt-[2px] scale-125 '
							/>
							<p className='m-0 mb-0 ml-1 p-0 text-[14px] font-medium text-blue-light-high dark:text-white md:text-[14px]'>
								A new Progress Report was added {getRelativeTime(postData?.progress_report?.[0]?.created_at)} for this referenda.
							</p>
						</div>
					}
					key='1'
					className='m-0 bg-[#F0EEFE] p-0 dark:bg-transparent'
				>
					<section className='w-full bg-[#F0EEFE] dark:bg-transparent'>
						{postData?.progress_report?.[0]?.progress_summary && (
							<div className='-mt-2 flex flex-col gap-y-2'>
								<h1 className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>Progress Report Summary</h1>
								<p className='m-0 p-0 text-sm text-bodyBlue'>
									<Markdown
										className='post-content m-0 p-0'
										md={postData?.progress_report?.[0]?.progress_summary}
										theme={theme}
									/>
								</p>
							</div>
						)}

						<div className='mb-1 mt-4 flex flex-col rounded-md border border-solid border-[#D2D8E0] bg-white px-4 py-2 dark:border-separatorDark dark:bg-highlightBg '>
							<div className='flex items-center justify-start gap-x-2'>
								<div className='flex h-[32px] w-[32px] items-center justify-center rounded-md bg-[#F9173E]'>
									<ImageIcon
										src='/assets/icons/pdf-icon.svg'
										alt='pdf.icon'
									/>
								</div>
								<div className='flex flex-col gap-y-0.5'>
									<a
										href={postData?.progress_report?.[0]?.progress_file}
										target='_blank'
										className='m-0 cursor-pointer p-0 text-xs font-medium capitalize text-bodyBlue dark:text-white '
										rel='noreferrer'
									>
										{`Progress Report - ${postData?.postType.replaceAll('_', ' ')} - ${postData?.postIndex}`}
									</a>
									<p className='m-0 p-0 text-[10px] font-normal capitalize text-sidebarBlue dark:text-blue-dark-medium '>PDF Document</p>
								</div>
							</div>
						</div>
						<p
							className='m-0 mt-4 cursor-pointer p-0 text-xs font-semibold text-pink_primary'
							onClick={() => {
								const currentQuery = router.query;
								router.push({
									pathname: router.pathname,
									query: {
										...currentQuery,
										tab: 'evaluation'
									}
								});
							}}
						>
							Show more
						</p>
					</section>
				</Panel>
			</Collapse>
		</div>
	);
};

export default styled(PostProgressReport)`
	.ant-collapse-content-box {
		background: ${(props: any) => (props.theme === 'dark' ? 'transparent' : '#f0eefe')} !important;
	}

	.ant-collapse .ant-collapse-content {
		border-top: 1px solid #796eec !important;
		border-bottom: 1px solid #796eec !important;
	}
	.ant-collapse-large > .ant-collapse-item > .ant-collapse-header {
		padding: 8px 24px;
	}
`;
