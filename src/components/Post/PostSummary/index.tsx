// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, Modal } from 'antd';
import React, { FC, useState } from 'react';
import classNames from 'classnames';
import Markdown from '~src/ui-components/Markdown';
import styled from 'styled-components';
import { AiStarIcon, SummaryModalClose } from '~src/ui-components/CustomIcons';
import { usePostDataContext } from '~src/context';
import { poppins } from 'pages/_app';
import EvalutionSummary from './EvalutionSummary';
import ImageIcon from '~src/ui-components/ImageIcon';

interface IPostSummaryProps {
	className?: string;
	theme?: string;
}

const sanitizeSummary = (md: string) => {
	const newMd = (md || '').trim();
	return newMd;
};

const PostSummary: FC<IPostSummaryProps> = (props: any) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { className, theme } = props;
	const {
		postData: { summary }
	} = usePostDataContext();
	const [open, setOpen] = useState(false);
	return (
		<section className={classNames(className, 'flex items-center justify-center')}>
			<Divider
				className='mr-3 hidden md:block'
				type='vertical'
				style={{ borderLeft: '1px solid #485F7D' }}
			/>
			<button
				onClick={() => setOpen(true)}
				className='ai-btn-border flex cursor-pointer items-center justify-center gap-x-1 bg-white p-[1.5px] text-xs font-medium leading-[18px] text-lightBlue outline-none dark:bg-section-dark-overlay dark:text-blue-dark-medium'
			>
				<p className='m-0 flex items-center justify-center rounded-[5px] bg-white px-2 py-1 dark:bg-inactiveIconDark'>
					<span className='flex items-center justify-center text-lg text-lightBlue dark:text-blue-dark-medium'>
						<AiStarIcon />
					</span>
					<span className='text-xs font-medium leading-[18px] tracking-[0.048px]'>AI Summary</span>
				</p>
			</button>
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				className={classNames(
					className,
					'ml-auto h-[calc(100vh-250px)] pb-0 pl-0 md:min-w-[604px] dark:[&>.ant-modal-content]:bg-section-dark-overlay',
					poppins.className,
					poppins.variable
				)}
				open={open}
				onCancel={() => setOpen(false)}
				closable={false}
				title={
					<div className='m-0 flex items-start justify-between rounded-t-[14px] p-5 pb-4 dark:bg-section-dark-overlay md:items-center md:p-6 md:pb-4'>
						<article className='flex flex-col gap-x-[6px] md:flex-row md:items-center'>
							<h3 className='m-0 flex items-center gap-x-2 p-0'>
								<span className='flex items-center justify-center text-2xl text-lightBlue dark:text-blue-dark-medium'>
									<AiStarIcon />
								</span>
								<span className='text-lg font-semibold leading-7 tracking-[0.03px] text-bodyBlue dark:text-blue-dark-high md:text-xl md:leading-6'>AI Summary</span>
							</h3>
							<div className='flex items-center gap-x-1 rounded-[4px] border border-solid border-section-light-container bg-[rgba(210,216,224,0.20)] py-1 pl-[6px] pr-[8px] dark:border-[#3B444F] md:py-[6px] md:pl-[10px] md:pr-3'>
								{/* <OpenAiIcon className='text-base md:text-2xl' /> */}
								<ImageIcon
									src='/assets/icons/openai.svg'
									alt='openai icon'
									imgWrapperClassName='w-6 h-6  text-base md:text-2xl flex justify-center items-center'
								/>
								<p className='m-0 text-[10px] font-semibold leading-normal tracking-[0.24px] text-bodyBlue dark:text-blue-dark-high md:text-xs'>Powered by OpenAI</p>
							</div>
						</article>
						<button
							onClick={() => setOpen(false)}
							className='mt-2 flex cursor-pointer items-center justify-center border-none bg-transparent outline-none md:mt-0'
						>
							<SummaryModalClose className='text-sm text-lightBlue dark:text-icon-dark-inactive' />
						</button>
					</div>
				}
				footer={null}
			>
				<Divider className='m-0 bg-[#e1e6eb] p-0 dark:bg-separatorDark' />
				<div className='p-4 px-5 md:p-6'>
					<Markdown
						className='md text-sm font-normal leading-[26px] tracking-[0.14px] text-bodyBlue dark:text-blue-dark-high'
						md={sanitizeSummary(summary || '')}
					/>
					<div className='mt-4 border-0 border-t-[1.5px] border-dashed border-section-light-container' />
					<EvalutionSummary />
				</div>
			</Modal>
		</section>
	);
};

export default styled(PostSummary)`
	.ant-modal-content {
		border-radius: 14px !important;
		padding: 0 !important;
		margin: auto !important;
	}
	.ant-modal-header {
		border-radius: 14px !important;
		margin: 0 !important;
	}
	.md > p {
		margin: 0 !important;
		color: ${(props: any) => (props.theme === 'dark' ? '#fff' : '#243A57')} !important;
		font-weight: 400 !important;
	}
	.md > ul {
		color: ${(props: any) => (props.theme === 'dark' ? '#fff' : '#243A57')} !important;
		font-weight: 400 !important;
	}
	.md > ul > li {
		color: ${(props: any) => (props.theme === 'dark' ? '#fff' : '#243A57')} !important;
		font-weight: 400 !important;
	}
	.ai-btn-border {
		background-image: linear-gradient(95.24deg, #cf2dab -3.77%, #40e8ff 11.75%, rgba(106, 65, 221, 0.72) 65.2%, #b62e76 89.54%, rgba(0, 0, 0, 0) 102.72%) !important;
		background-origin: border-box !important;
		background-clip: padding-box, border-box !important;
		border-radius: 8px !important;
		border: 1px solid transparent !important;
	}
`;
