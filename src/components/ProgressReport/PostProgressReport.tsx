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
const { Panel } = Collapse;

interface Props {
	className?: string;
}

const PostProgressReport = ({ className }: Props) => {
	const { postData } = usePostDataContext();
	const router = useRouter();
	console.log(postData?.progress_report);
	return (
		<div className={`${className} mt-2`}>
			<Collapse
				size='large'
				className={'h-full border-solid border-[#796EEC] bg-[#F0EEFE]'}
				expandIconPosition='end'
				expandIcon={({ isActive }) => {
					return isActive ? <ExpandIcon /> : <CollapseIcon />;
				}}
			>
				<Panel
					header={
						<div className='channel-header mt-0.5 flex items-center gap-[6px]'>
							<ImageIcon
								src='/assets/icons/books-icon.svg'
								alt='progress-file-icon'
							/>
							<p className='mb-0 ml-1 bg-[#F0EEFE] text-[14px] font-normal text-blue-light-high md:text-[14px]'>A new Progress Report was added for this referenda.</p>
						</div>
					}
					key='1'
				>
					<section className=''>
						{postData?.progress_report?.progress_summary && (
							<div className='flex flex-col gap-y-2'>
								<h1 className='text-sm font-semibold text-bodyBlue dark:text-white'>Progress Report Summary</h1>
								<p className='text-sm text-bodyBlue dark:text-white'>{postData?.progress_report?.progress_summary}</p>
							</div>
						)}
						<div className='flex flex-col gap-y-3 rounded-md border border-solid border-[#D2D8E0] p-4'>
							<iframe
								src={`https://docs.google.com/viewer?url=${encodeURIComponent(postData?.progress_report?.progress_file)}&embedded=true`}
								width='100%'
								height='180px'
								title='PDF Preview'
								className='rounded-md border border-white'
							></iframe>
							<div className='flex items-center justify-start gap-x-2'>
								<div className='flex h-[32px] w-[32px] items-center justify-center rounded-md bg-[#F9173E]'>
									<ImageIcon
										src='/assets/icons/pdf-icon.svg'
										alt='pdf.icon'
									/>
								</div>
								<p className='m-0 p-0 text-xs text-sidebarBlue dark:text-section-dark-overlay'>{postData?.progress_report?.progress_name || 'Progress Report'}</p>
							</div>
						</div>
						<p
							className='m-0 mt-4 cursor-pointer p-0 text-xs text-pink_primary'
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
							show more
						</p>
					</section>
				</Panel>
			</Collapse>
		</div>
	);
};

export default PostProgressReport;
