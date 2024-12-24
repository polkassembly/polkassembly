// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, Modal } from 'antd';
import { dmSans } from 'pages/_app';
import React from 'react';
import { styled } from 'styled-components';
import { useCurrentTokenDataSelector, useNetworkSelector } from '~src/redux/selectors';
import { IChildBountySubmission } from '~src/types';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import NameLabel from '~src/ui-components/NameLabel';
import formatBnBalance from '~src/util/formatBnBalance';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import { ClockCircleOutlined } from '@ant-design/icons';
import Markdown from '~src/ui-components/Markdown';
import { useTheme } from 'next-themes';

interface Props {
	openModal: boolean;
	setOpenModal: (pre: boolean) => void;
	submission: IChildBountySubmission;
}

const SubmissionDetailModal = ({ openModal, setOpenModal, submission }: Props) => {
	const { title, proposer, createdAt, reqAmount, content, link } = submission;
	const { currentTokenPrice } = useCurrentTokenDataSelector();
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const date = new Date(createdAt);
	return (
		<Modal
			title={
				<div className={`${dmSans.variable} ${dmSans.className} text-xl font-bold text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high`}>
					<span className='mt-1'>{title}</span>
					<Divider className='border-l-1 my-1  border-[#D2D8E0B2] dark:border-separatorDark md:inline-block' />
				</div>
			}
			open={openModal}
			footer={false}
			zIndex={1008}
			wrapClassName={' dark:bg-modalOverlayDark rounded-[14px]'}
			className={` ${dmSans.variable} ${dmSans.className} w-[605px] rounded-[14px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			onCancel={() => setOpenModal(false)}
			closeIcon={
				<span onClick={() => setOpenModal(false)}>
					<CloseIcon className=' text-lightBlue dark:text-icon-dark-inactive' />
				</span>
			}
		>
			<div>
				<div className='flex items-center gap-1 rounded-full'>
					<NameLabel
						defaultAddress={proposer}
						usernameClassName='text-xs -mt-[4px] text-ellipsis overflow-hidden'
						className='flex items-center'
						isUsedInBountyPage={true}
					/>

					{createdAt && (
						<>
							<Divider
								type='vertical'
								className='border-l-1 mx-1 border-[#D2D8E0B2] dark:border-separatorDark md:inline-block'
							/>
							<div className='items-center text-xs font-normal text-lightBlue dark:text-icon-dark-inactive'>
								<ClockCircleOutlined className='mr-[2px]' /> <span></span>
								{getRelativeCreatedAt(date)}
							</div>
						</>
					)}
					{reqAmount && (
						<>
							<Divider
								type='vertical'
								className='border-l-1 mx-1 border-[#D2D8E0B2] dark:border-separatorDark md:inline-block'
							/>
							<span className='text-base font-bold text-[#E5007A]'>
								${Number(currentTokenPrice) * Number(formatBnBalance(String(reqAmount), { numberAfterComma: 2, withThousandDelimitor: false, withUnit: false }, network))}
							</span>
						</>
					)}
				</div>
				<Divider className='border-l-1 my-1 border-[#D2D8E0B2] dark:border-separatorDark md:inline-block' />
				{content && (
					<Markdown
						md={content}
						theme={theme}
						disableQuote={true}
					/>
				)}
				{link && (
					<div className='flex w-min items-center gap-4 rounded-[10px] border border-solid border-[#D2D8E0B2] px-3 py-2 dark:border-separatorDark'>
						<span className='text-sm text-blue-light-medium dark:text-blue-dark-medium'>Link:</span>
						<span className='text-[13px] text-blue-light-high dark:text-blue-dark-high'>{link}</span>
					</div>
				)}
			</div>
		</Modal>
	);
};

export default styled(SubmissionDetailModal)`
	.ant-modal-content {
		padding: 0px !important;
		border-radius: 14px;
	}
`;
