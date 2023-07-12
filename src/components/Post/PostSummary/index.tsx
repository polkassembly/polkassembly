// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, Modal } from 'antd';
import React, { FC, useState } from 'react';
import classNames from 'classnames';
import Markdown from '~src/ui-components/Markdown';
import styled from 'styled-components';
import { SummaryModalClose } from '~src/ui-components/CustomIcons';
import { usePostDataContext } from '~src/context';

interface IPostSummaryProps {
    className?: string;
}

const sanitizeSummary = (md: string) => {
	let newMd = (md || '').trim();
	if (newMd.startsWith('-')) {
		newMd = newMd.substring(1);
	} else if (newMd.startsWith(':')) {
		newMd = newMd.substring(1);
	}
	return newMd;
};

const PostSummary: FC<IPostSummaryProps> = (props) => {
	const { className } = props;
	const { postData: { summary } } = usePostDataContext();
	const [open, setOpen] = useState(false);
	return (
		<section className={classNames(className, 'flex items-center')}>
			<Divider type="vertical" style={{ borderLeft: '1px solid #485F7D' }} />
			<button
				onClick={() => setOpen(true)}
				className='border-none outline-none flex items-center justify-center cursor-pointer text-pink_primary bg-transparent text-xs leading-[18px] font-medium'
			>
                View Summary
			</button>
			<Modal
				className={className}
				open={open}
				onCancel={() => setOpen(false)}
				closable={false}
				title={<div className='p-5 md:p-6 m-0 flex items-center justify-between rounded-[14px]'>
					<h3 className='font-semibold text-xl leading-[24px] text-bodyBlue m-0 p-0'>View Summary</h3>
					<button onClick={() => setOpen(false)} className='cursor-pointer border-none outline-none bg-transparent flex items-center justify-center'>
						<SummaryModalClose className='text-sm text-lightBlue' />
					</button>
				</div>}
				footer={
					<div className='w-full px-5 py-3 md:px-6 md:py-4 rounded-[14px]'>
						<button onClick={() => setOpen(false)} className='border-none outline-none py-1 px-4 rounded-[4px] bg-pink_primary text-white w-full min-h-[40px] font-medium text-sm leading-[21px] cursor-pointer'>
							Back To Proposal
						</button>
					</div>
				}
			>
				<Divider className='m-0 p-0' />
				<div className='p-5 md:p-6'>
					<Markdown className='md' md={sanitizeSummary(summary || '')} />
				</div>
				<Divider className='m-0 p-0' />
			</Modal>
		</section>
	);
};

export default styled(PostSummary)`
	.ant-modal-content {
		border-radius: 14px !important;
		padding: 0 !important;
	}
	.ant-modal-footer {
		border-radius: 14px !important;
		margin: 0 !important;
	}
	.ant-modal-header {
		border-radius: 14px !important;
		margin: 0 !important;
	}
	.md > p {
		margin: 0 !important;
	}
`;