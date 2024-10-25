// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState } from 'react';
import { Button, Divider, Timeline } from 'antd';
import ImageIcon from '~src/ui-components/ImageIcon';
import styled from 'styled-components';
import { progressReportActions } from '~src/redux/progressReport';
import SignupPopup from '~src/ui-components/SignupPopup';
import LoginPopup from '~src/ui-components/loginPopup';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { usePostDataContext } from '~src/context';
import ReportInfo from './ReportInfo';

interface IUploadMultipleReports {
	className?: string;
	theme?: string;
}

const UploadMultipleReports: FC<IUploadMultipleReports> = (props) => {
	const { className } = props;
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);
	const { postData } = usePostDataContext();
	const { loginAddress } = useUserDetailsSelector();
	const dispatch = useDispatch();

	return (
		<section className={`${className} mt-1`}>
			<Timeline className={`${className}`}>
				<Timeline.Item
					dot={
						<div className='flex h-8 w-8 items-center justify-center rounded-full bg-[#EAECEE] dark:bg-highlightBg'>
							<ImageIcon
								src='/assets/icons/cloud-upload-icon.svg'
								alt='upload icon'
							/>
						</div>
					}
				>
					<Button
						className='-mt-1 ml-1 cursor-pointer border-none bg-transparent p-0 text-sm font-medium text-pink_primary shadow-none'
						onClick={() => {
							if (loginAddress) {
								dispatch(progressReportActions.setAddProgressReportModalOpen(true));
							} else {
								setLoginOpen(true);
							}
						}}
					>
						Upload new progress report
					</Button>
					<Divider
						style={{ background: '#D2D8E0', flexGrow: 1 }}
						className='mt-4 dark:bg-separatorDark'
					/>
				</Timeline.Item>
				{postData?.progress_report && Object.keys(postData.progress_report).length > 0 ? (
					Object.entries(postData.progress_report).map(([key, report]: any, index) => (
						<Timeline.Item
							key={key}
							className='-mt-6'
							dot={<div className='flex h-8 w-8 items-center justify-center rounded-full bg-[#EAECEE] text-sidebarBlue dark:bg-highlightBg dark:text-white'>{index + 1}</div>}
						>
							<>
								<ReportInfo
									report={report}
									index={index}
								/>
								<Divider
									style={{ background: '#D2D8E0', flexGrow: 1 }}
									className='mt-6 dark:bg-separatorDark'
								/>
							</>
						</Timeline.Item>
					))
				) : (
					<p className='m-0 p-0 text-sm text-bodyBlue dark:text-white'>No progress reports available</p>
				)}
			</Timeline>

			<SignupPopup
				setLoginOpen={setLoginOpen}
				modalOpen={openSignup}
				setModalOpen={setSignupOpen}
				isModal={true}
			/>
			<LoginPopup
				setSignupOpen={setSignupOpen}
				modalOpen={openLogin}
				setModalOpen={setLoginOpen}
				isModal={true}
			/>
		</section>
	);
};

export default styled(UploadMultipleReports)`
	.ant-timeline .ant-timeline-item-head {
		background-color: transparent !important;
	}
	.ant-timeline .ant-timeline-item-tail {
		border-inline-start: ${({ theme }: { theme: any }) => (theme === 'dark' ? '1.5px solid #4b4b4b' : '1.5px solid #485f7d')} !important;
	}
`;
