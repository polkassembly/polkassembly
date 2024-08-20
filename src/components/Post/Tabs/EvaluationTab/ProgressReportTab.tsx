// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Collapse } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import ImageIcon from '~src/ui-components/ImageIcon';
import dynamic from 'next/dynamic';
import Skeleton from '~src/basic-components/Skeleton';
import { useProgressReportSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { usePostDataContext } from '~src/context';
const UploadModalContent = dynamic(() => import('~src/components/ProgressReport/UploadModalContent'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const { Panel } = Collapse;

interface Props {
	className?: string;
}

const ProgressReportTab = ({ className }: Props) => {
	const { post_report_added } = useProgressReportSelector();
	const currentUser = useUserDetailsSelector();
	const { postData } = usePostDataContext();

	return (
		<div className={`${className}`}>
			<Collapse
				size='large'
				className={'bg-white dark:border-separatorDark dark:bg-section-dark-overlay'}
				expandIconPosition='end'
				expandIcon={({ isActive }) => {
					return isActive ? <ExpandIcon /> : <CollapseIcon />;
				}}
			>
				<Panel
					header={
						<div className='channel-header flex items-center gap-[6px]'>
							<ImageIcon
								src='/assets/icons/file-icon.svg'
								alt='progress-file-icon'
							/>
							<h3 className='mb-0 ml-1 mt-[2px] text-[16px] font-semibold leading-[21px] tracking-wide text-blue-light-high dark:text-blue-dark-high md:text-[18px]'>
								Progress Reports
							</h3>
						</div>
					}
					key='1'
				>
					{/* remove ! sign check */}
					{/* NOTE: Push this progress report field in backend and use that field check in place of post_report_added */}
					{!(postData.proposer === currentUser?.loginAddress) && postData?.status === 'Executed' && !post_report_added && <UploadModalContent />}
				</Panel>
			</Collapse>
		</div>
	);
};

export default ProgressReportTab;
