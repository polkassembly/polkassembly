// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { usePostDataContext } from '~src/context';
import { ClockCircleOutlined, StarFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import NameLabel from '~src/ui-components/NameLabel';
import ImageIcon from '~src/ui-components/ImageIcon';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import RatingModal from '../RatingModal';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { useProgressReportSelector } from '~src/redux/selectors';
import { progressReportActions } from '~src/redux/progressReport';
import { useDispatch } from 'react-redux';
import RatingSuccessModal from '../RatingModal/RatingSuccessModal';
import queueNotification from '~src/ui-components/QueueNotification';
import { IRating, NotificationStatus } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import Markdown from '~src/ui-components/Markdown';
import { useTheme } from 'next-themes';

const ProgressReportInfo = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const { postData, setPostData } = usePostDataContext();
	const [averageRating, setAverageRating] = useState<number>();
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();
	const { report_rating, open_rating_modal, open_rating_success_modal, is_summary_edited } = useProgressReportSelector();

	const addUserRating = async () => {
		setLoading(true);
		const { data, error: editError } = await nextApiClientFetch<any>('api/v1/progressReport/addReportRating', {
			postId: postData?.postIndex,
			proposalType: postData?.postType,
			rating: report_rating
		});
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
			console.log('progress: ', report_rating);
			console.log('progress2: ', data);
			// const ratingData = postData?.progress_report?.ratings;
			setPostData((prev) => ({
				...prev,
				progress_report
			}));
			dispatch(progressReportActions.setOpenRatingModal(false));
			dispatch(progressReportActions.setOpenRatingSuccessModal(true));
		} else {
			console.log('failed to save rating');
		}
	};

	const getRatingInfo = () => {
		setAverageRating(postData?.progress_report?.ratings?.reduce((sum: number, current: IRating) => sum + current.rating, 0) / postData?.progress_report?.ratings?.length);
	};

	useEffect(() => {
		getRatingInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postData?.progress_report]);

	return (
		<>
			<section className='flex flex-col gap-y-2'>
				<header className='flex items-center justify-start gap-x-1'>
					<NameLabel
						defaultAddress={postData?.proposer || ''}
						truncateUsername
						usernameClassName='text-xs text-ellipsis text-sidebarBlue overflow-hidden'
					/>
					<Divider
						className='hidden md:inline-block'
						type='vertical'
						style={{ borderLeft: '1px solid var(--lightBlue)' }}
					/>
					<ClockCircleOutlined className='dark:text-icon-dark-inactive' />
					<p className='m-0 p-0 text-xs text-sidebarBlue dark:text-icon-dark-inactive'>{dayjs(postData?.progress_report?.progress_addedOn).format('DD MMM YYYY')}</p>
					{(postData?.progress_report?.isEdited || is_summary_edited) && <p className='m-0 ml-auto mt-1 p-0 text-[10px] text-sidebarBlue dark:text-[#909090]'>(Edited)</p>}
				</header>
				<article className=''>
					{postData?.progress_report?.progress_summary && (
						<div className='flex flex-col gap-y-2'>
							<p className='mt-2 text-sm text-bodyBlue dark:text-white'>
								<Markdown
									className='post-content'
									md={postData?.progress_report?.progress_summary}
									theme={theme}
								/>
							</p>
						</div>
					)}
					{postData?.progress_report?.ratings?.length > 0 && (
						<p className='m-0 -mt-2 mb-4 p-0 text-xs text-sidebarBlue dark:text-[#909090]'>
							Average Rating({postData?.progress_report?.ratings?.length}): {averageRating}
						</p>
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
							<p className='m-0 p-0 text-xs text-sidebarBlue dark:text-icon-dark-inactive'>{postData?.progress_report?.progress_name || 'Progress Report'}</p>
						</div>
					</div>
				</article>
				<Button
					className='m-0 flex items-center justify-start gap-x-1 border-none bg-transparent p-0 text-sm text-pink_primary'
					onClick={() => {
						dispatch(progressReportActions.setOpenRatingModal(true));
					}}
				>
					<StarFilled />
					<p className='m-0 p-0'>Rate Delievery</p>
				</Button>
			</section>
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				className={classNames(poppins.className, poppins.variable, 'w-[600px]')}
				open={open_rating_modal}
				footer={
					<div className='-mx-6 mt-9 flex items-center justify-end gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-2 pt-6'>
						<CustomButton
							variant='default'
							text='Cancel'
							buttonsize='sm'
							disabled={loading}
							onClick={() => {
								dispatch(progressReportActions.setOpenRatingModal(false));
							}}
						/>
						<CustomButton
							variant='primary'
							loading={loading}
							className={`${loading ? 'opacity-60' : ''}`}
							text='Rate'
							buttonsize='sm'
							disabled={loading}
							onClick={() => {
								addUserRating();
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
				<RatingModal />
			</Modal>
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				className={classNames(poppins.className, poppins.variable, 'mt-[100px] w-[600px]')}
				open={open_rating_success_modal}
				// open={true}
				maskClosable={false}
				footer={
					<CustomButton
						variant='primary'
						className='w-full'
						text='close'
						onClick={() => {
							dispatch(progressReportActions.setOpenRatingSuccessModal(false));
						}}
					/>
				}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={() => {}}
			>
				<RatingSuccessModal />
			</Modal>
		</>
	);
};

export default ProgressReportInfo;
