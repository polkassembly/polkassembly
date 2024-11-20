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
import { ArrowDownIcon } from '~src/ui-components/CustomIcons';
import { useTheme } from 'next-themes';
import { Collapse } from '~src/components/Settings/Notifications/common-ui/Collapse';
import dayjs from 'dayjs';
import { ClockCircleOutlined, StarFilled } from '@ant-design/icons';
import { IRating } from '~src/types';

const { Panel } = Collapse;

interface IUploadMultipleReports {
	className?: string;
	theme?: string;
}

const UploadMultipleReports: FC<IUploadMultipleReports> = (props) => {
	const { className } = props;
	const { resolvedTheme: theme } = useTheme();
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);
	const { postData } = usePostDataContext();

	const { loginAddress } = useUserDetailsSelector();

	const dispatch = useDispatch();

	const getRatingInfo = (ratings: IRating[]) => {
		return ratings?.reduce((sum: number, current: IRating) => sum + current.rating, 0) / ratings?.length;
	};

	const renderStars = (report: any) => {
		if (getRatingInfo(report?.ratings)) {
			const averageRating = getRatingInfo(report?.ratings);
			const fullStars = Math.floor(averageRating);
			const halfStar = averageRating % 1 >= 0.5 ? 1 : 0;
			const totalStars = fullStars + halfStar;

			const starsArray = [];

			for (let i = 0; i < fullStars; i++) {
				starsArray.push(
					<StarFilled
						className='text-[#FFAE06]'
						key={i}
					/>
				);
			}

			if (halfStar) {
				starsArray.push(
					<StarFilled
						key='half'
						className='scale-110 text-[#FFAE06]'
					/>
				);
			}

			for (let i = totalStars; i < 5; i++) {
				starsArray.push(
					<StarFilled
						key={`empty-${i}`}
						style={{ color: '#d9d9d9' }}
						className='scale-110'
					/>
				);
			}

			return starsArray;
		}

		return Array.from({ length: 5 }, (_, i) => (
			<StarFilled
				key={i}
				style={{ color: '#d9d9d9' }}
			/>
		));
	};

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
							dot={
								<div className='flex h-8 w-8 items-center justify-center rounded-full bg-[#EAECEE] text-sidebarBlue dark:bg-highlightBg dark:text-white'>
									{Object.keys(postData?.progress_report).length - index}
								</div>
							}
						>
							<>
								<Collapse
									size='large'
									theme={theme as any}
									className='ml-1  bg-white dark:border-separatorDark dark:bg-section-dark-overlay'
									expandIconPosition='end'
									expandIcon={({ isActive }) =>
										isActive ? <ArrowDownIcon className='rotate-180 dark:text-blue-dark-medium' /> : <ArrowDownIcon className='dark:text-blue-dark-medium' />
									}
									defaultActiveKey={index === 0 ? ['1'] : []}
								>
									<Panel
										header={
											<div className='flex items-center justify-between'>
												<div className='flex items-center gap-x-2'>
													<h1 className='m-0 p-0 text-base font-medium text-bodyBlue dark:text-white'>{`Progress Report #${
														Object.keys(postData?.progress_report).length - index
													}`}</h1>
													<ClockCircleOutlined className='dark:text-icon-dark-inactive' />
													<p className='m-0 p-0 text-xs text-sidebarBlue dark:text-icon-dark-inactive'>{dayjs(report?.created_at).format('DD MMM YYYY')}</p>
													{report?.isEdited && <p className='m-0 ml-auto p-0 text-[10px] text-sidebarBlue dark:text-blue-dark-medium'>(Edited)</p>}
												</div>
												{report?.ratings?.length > 0 && (
													<p className='m-0 ml-auto flex items-center p-0 text-xs font-normal text-sidebarBlue dark:text-blue-dark-medium'>
														Avg Rating({report.ratings.length}): <div className='ml-2 flex'>{renderStars(report)}</div>
													</p>
												)}
											</div>
										}
										key='1'
									>
										<ReportInfo
											report={report}
											index={index}
										/>
									</Panel>
								</Collapse>
								{index + 1 !== Object.keys(postData.progress_report).length && (
									<Divider
										style={{ background: '#D2D8E0', flexGrow: 1 }}
										className='mt-5 dark:bg-separatorDark'
									/>
								)}
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
	.ant-collapse-header {
		padding: 0 !important;
	}
	.ant-timeline .ant-timeline-item-tail {
		border-inline-start: ${({ theme }: { theme: any }) => (theme === 'dark' ? '1.5px solid #4b4b4b' : '1.5px solid #485f7d')} !important;
	}
	.ant-collapse {
		border: none !important;
	}
	.ant-collapse .ant-collapse-content {
		border: none !important;
	}
	.ant-collapse > .ant-collapse-item {
		border: none !important;
	}
	.ant-collapse-large > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
		padding: 0 !important;
	}
	.ant-timeline .ant-timeline-item-tail {
		height: calc(100% - 15px) !important;
	}
`;
