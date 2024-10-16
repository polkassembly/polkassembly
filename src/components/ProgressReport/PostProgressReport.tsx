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
const { Panel } = Collapse;

interface Props {
	className?: string;
}

const PostProgressReport = ({ className }: Props) => {
	const { postData } = usePostDataContext();
	const router = useRouter();

	return (
		<div className={`${className} mt-2 rounded-lg border-solid border-[#796EEC]`}>
			<Collapse
				size='large'
				className={'h-full bg-[#F0EEFE]'}
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
							<p className='m-0 mb-0 ml-1 p-0 text-[14px] font-medium text-blue-light-high md:text-[14px]'>A new Progress Report was added for this referenda.</p>
						</div>
					}
					key='1'
					className='m-0 p-0'
					style={{ backgroundColor: '#F0EEFE' }}
				>
					<section className='w-full bg-[#F0EEFE]'>
						{postData?.progress_report?.progress_summary && (
							<div className='-mt-2 flex flex-col gap-y-2'>
								<h1 className='m-0 p-0 text-sm font-semibold text-bodyBlue'>Progress Report Summary</h1>
								<p className='m-0 p-0 text-sm text-bodyBlue'>{postData?.progress_report?.progress_summary}</p>
							</div>
						)}
						<div className='mt-4 flex flex-col gap-y-3 rounded-md border border-solid border-[#D2D8E0] bg-white p-4'>
							<iframe
								src={`https://docs.google.com/viewer?url=${encodeURIComponent(postData?.progress_report?.progress_file)}&embedded=true`}
								width='100%'
								height='180px'
								title='PDF Preview'
								className='rounded-md border border-white bg-white'
							></iframe>
							<div className='flex items-center justify-start gap-x-2'>
								<div className='flex h-[32px] w-[32px] items-center justify-center rounded-md bg-[#F9173E]'>
									<ImageIcon
										src='/assets/icons/pdf-icon.svg'
										alt='pdf.icon'
									/>
								</div>
								<p className='m-0 p-0 text-xs capitalize text-sidebarBlue dark:text-blue-dark-medium '>{`Progress Report - ${postData?.postType.replaceAll(
									'_',
									' '
								)} - ${postData?.postIndex}`}</p>
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
		background: #f0eefe !important;
	}

	.ant-collapse .ant-collapse-content {
		border-top: 1px solid #796eec !important;
		border-bottom: 1px solid #796eec !important;
	}
	.ant-collapse-large > .ant-collapse-item > .ant-collapse-header {
		padding: 8px 24px;
	}
`;
