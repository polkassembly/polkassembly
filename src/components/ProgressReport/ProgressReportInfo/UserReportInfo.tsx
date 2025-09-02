// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useMemo, useState } from 'react';
import { Button, Divider, Modal, Timeline } from 'antd';
import styled from 'styled-components';
import SignupPopup from '~src/ui-components/SignupPopup';
import LoginPopup from '~src/ui-components/loginPopup';
import { usePostDataContext } from '~src/context';
import { StarFilled } from '@ant-design/icons';
import ReportDetails from './ReportDetails';
import RatingSuccessModal from '../RatingModal/RatingSuccessModal';
import { progressReportActions } from '~src/redux/progressReport';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import classNames from 'classnames';
import { dmSans } from 'pages/_app';
import RatingModal from '../RatingModal';
import { useDispatch } from 'react-redux';
import { useProgressReportSelector, useUserDetailsSelector } from '~src/redux/selectors';
import queueNotification from '~src/ui-components/QueueNotification';
import { IProgressReport, NotificationStatus } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import Image from 'next/image';
import Link from 'next/link';

interface IUserReportInfo {
	className?: string;
	theme?: string;
}

const UserReportInfo: FC<IUserReportInfo> = (props) => {
	const { className } = props;
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);
	const { loginAddress } = useUserDetailsSelector();
	const { postData, setPostData } = usePostDataContext();
	const [loading, setLoading] = useState<boolean>(false);
	const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
	const dispatch = useDispatch();
	const { open_rating_modal, open_rating_success_modal, report_rating } = useProgressReportSelector();
	const ogTrackerUrl =
		!!postData?.track_name && !!postData?.postIndex
			? `https://app.ogtracker.io/${postData.track_name.replace(/^[A-Z]/, (c) => c.toLowerCase())}/${postData.postIndex}`
			: 'https://app.ogtracker.io/';

	const uniqueReports = useMemo(() => {
		if (!postData?.progress_report) return [];
		return Object.entries(postData?.progress_report as IProgressReport)?.sort((a, b) => new Date(a[1]?.created_at)?.getTime() - new Date(b[1]?.created_at).getTime());
	}, [postData?.progress_report]);

	const addUserRating = async () => {
		setLoading(true);
		let isFromOGTracker = false;
		let ogReport;
		for (const key in postData?.progress_report) {
			if (postData?.progress_report[key]?.id === selectedReportId) {
				isFromOGTracker = true;
				ogReport = postData?.progress_report[key];
				break;
			}
		}
		const ogBody = {
			created_at: ogReport?.created_at,
			postId: postData?.postIndex,
			progress_file: ogReport?.progress_file,
			progress_summary: ogReport?.progress_summary,
			proposalType: postData?.postType,
			rating: report_rating,
			reportId: selectedReportId
		};

		const ratingBody = {
			postId: postData?.postIndex,
			proposalType: postData?.postType,
			rating: report_rating,
			reportId: selectedReportId
		};
		const apiUrl = isFromOGTracker ? 'api/v1/progressReport/addOGTrackersReportRating' : 'api/v1/progressReport/addReportRating';
		const body = isFromOGTracker ? ogBody : ratingBody;
		const { data, error: editError } = await nextApiClientFetch<{ message: string; progress_report?: object }>(apiUrl, body);
		if (editError || !data) {
			setLoading(false);
			console.error('Error saving rating', editError);
			queueNotification({
				header: 'Error!',
				message: 'Error in saving your rating.',
				status: NotificationStatus.ERROR
			});
		}
		if (data) {
			setLoading(false);
			queueNotification({
				header: 'Success!',
				message: 'Your rating is now added',
				status: NotificationStatus.SUCCESS
			});
			const { progress_report } = data;

			setPostData((prev) => ({
				...prev,
				progress_report: { ...(progress_report || {}), 0: { ...((progress_report as any)?.[0] || {}), tasks: postData?.progress_report?.[0]?.tasks || [] } }
			}));
			dispatch(progressReportActions.setOpenRatingModal(false));
			dispatch(progressReportActions.setOpenRatingSuccessModal(true));
		} else {
			console.log('failed to save rating');
		}
		setLoading(false);
	};

	return (
		<section className={`${className}`}>
			<Timeline
				className={`${className}`}
				reverse
				mode='left'
			>
				<div className='border-primary top-[calc(100% - 25px)] round absolute h-2.5 w-2.5 rounded-full border-4' />
				{uniqueReports.length > 0 ? (
					uniqueReports.map(([key, report], index) => (
						<Timeline.Item
							key={key}
							dot={
								index === 0 && (
									<div className='mt-2 flex h-8 w-8 items-center justify-center rounded-full  bg-[#EAECEE] text-sidebarBlue dark:bg-highlightBg dark:text-white'>
										{uniqueReports.length - index}
									</div>
								)
							}
						>
							<>
								<div className='flex w-full items-center justify-between space-x-4 px-2'>
									<div className='flex items-center gap-x-2'>
										<h1 className='m-0 p-0 text-base font-medium text-bodyBlue dark:text-white'>{`Progress Report #${
											Object.keys(postData?.progress_report || {})?.length - index
										}`}</h1>
										{report?.isEdited && <p className='m-0 ml-auto p-0 text-[10px] text-sidebarBlue dark:text-blue-dark-medium'>(Edited)</p>}
										{report?.isFromOgtracker && (
											<div className='flex items-center gap-x-1'>
												<span className=' rounded-full p-0.5 dark:bg-[#393939]'>
													<Image
														src='/assets/icons/ogTracker.svg'
														alt='ogtracker'
														height={22}
														width={22}
													/>
												</span>
												<Link
													href={ogTrackerUrl}
													target='_blank'
													className='m-0 p-0 font-medium text-blue-700 underline hover:text-blue-700'
													rel='noreferrer'
												>
													OG Tracker
												</Link>
											</div>
										)}
									</div>

									<Button
										className='m-0 flex items-center justify-start gap-x-1 border-none bg-transparent p-0 text-sm font-medium text-pink_primary shadow-none'
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											if (loginAddress) {
												dispatch(progressReportActions.setOpenRatingModal(true));
												setSelectedReportId(report?.id);
											} else {
												setLoginOpen(true);
											}
										}}
									>
										<div className='flex items-center gap-x-1'>
											<StarFilled className='text-base' />
											<span className='m-0 p-0 font-medium'>Rate Progress</span>
										</div>
									</Button>
								</div>

								<ReportDetails
									report={report}
									index={index}
									className='px-2'
								/>

								{index + 1 !== uniqueReports.length && (
									<Divider
										style={{ background: '#D2D8E0', flexGrow: 1 }}
										className='mt-4 dark:bg-separatorDark'
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

			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				className={classNames(dmSans.className, dmSans.variable, 'w-[600px]')}
				open={open_rating_modal}
				footer={
					<div className='-mx-6 mt-9 flex items-center justify-end gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-2 pt-6'>
						<CustomButton
							variant='solid'
							text='Cancel'
							buttonsize='sm'
							disabled={loading}
							onClick={() => {
								dispatch(progressReportActions.setOpenRatingModal(false));
							}}
						/>
						<CustomButton
							variant='solid'
							loading={loading}
							className={`${loading ? 'opacity-60' : ''}`}
							text='Rate'
							buttonsize='sm'
							disabled={loading}
							onClick={() => {
								addUserRating();
								setSelectedReportId(selectedReportId);
							}}
						/>
					</div>
				}
				maskClosable={false}
				closeIcon={<CloseIcon className='mt-2 text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={() => {
					dispatch(progressReportActions.setOpenRatingModal(false));
				}}
				title={
					<div className='-mx-6 flex items-center justify-start border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-5 text-lg tracking-wide text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
						<StarFilled className='mr-2' />
						Rate Delivery of Progress Report
					</div>
				}
			>
				<RatingModal reportId={selectedReportId} />
			</Modal>
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				className={classNames(dmSans.className, dmSans.variable, 'mt-[100px] w-[600px]')}
				open={open_rating_success_modal}
				maskClosable={false}
				footer={null}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={() => {
					dispatch(progressReportActions.setOpenRatingSuccessModal(false));
				}}
			>
				<RatingSuccessModal reportId={selectedReportId} />
			</Modal>
		</section>
	);
};

export default styled(UserReportInfo)`
	.ant-collapse-header {
		padding: 0 !important;
	}
	.ant-timeline .ant-timeline-item-tail {
		border-inline-start: ${({ theme }: { theme: any }) => (theme === 'dark' ? '1px solid #4b4b4b' : '1px solid #485f7d')} !important;
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
		padding: 2px !important;
	}
	.ant-timeline .ant-timeline-item-tail {
		height: calc(100% - 25px) !important;
	}
	.ant-timeline .ant-timeline-item {
		padding: 0 !important;
	}
	.ant-timeline .ant-timeline-item-last > .ant-timeline-item-tail {
		display: flex !important;
	}
	.ant-timeline .ant-timeline-item-head-blue {
		border: none !important;
	}
	.round {
		background-color: ${({ theme }: { theme: any }) => (theme === 'dark' ? 'white' : 'var(--lightBlue)')} !important;
		margin-top: -18px !important;
	}
`;
