// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Collapse } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import ImageIcon from '~src/ui-components/ImageIcon';
const { Panel } = Collapse;

interface Props {
	className?: string;
}

const PostProgressReport = ({ className }: Props) => {
	return (
		<div className={`${className} mt-2`}>
			<Collapse
				size='large'
				className={'border-solid border-[#796EEC] bg-[#F0EEFE]'}
				expandIconPosition='end'
				expandIcon={({ isActive }) => {
					return isActive ? <ExpandIcon /> : <CollapseIcon />;
				}}
			>
				<Panel
					header={
						<div className='channel-header mt-0.5 flex items-center gap-[6px]'>
							<ImageIcon
								src='/assets/icons/file-icon.svg'
								alt='progress-file-icon'
							/>
							<p className='mb-0 ml-1 text-[14px] font-normal text-blue-light-high dark:text-blue-dark-high md:text-[18px]'>A new Progress Report was added for this referenda.</p>
						</div>
					}
					key='1'
				>
					{/* Add post description here */}
				</Panel>
			</Collapse>
		</div>
	);
};

export default PostProgressReport;
