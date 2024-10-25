// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Divider, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { usePostDataContext } from '~src/context';
import { ClockCircleOutlined, StarFilled } from '@ant-design/icons';
import NameLabel from '~src/ui-components/NameLabel';
import ImageIcon from '~src/ui-components/ImageIcon';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import RatingModal from '../RatingModal';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { useProgressReportSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { progressReportActions } from '~src/redux/progressReport';
import { useDispatch } from 'react-redux';
import RatingSuccessModal from '../RatingModal/RatingSuccessModal';
import queueNotification from '~src/ui-components/QueueNotification';
import { IRating, NotificationStatus } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import Markdown from '~src/ui-components/Markdown';
import { useTheme } from 'next-themes';
import SignupPopup from '~src/ui-components/SignupPopup';
import LoginPopup from '~src/ui-components/loginPopup';
import dayjs from 'dayjs';

const ProgressReportInfo = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const { postData, setPostData } = usePostDataContext();
	const [averageRating, setAverageRating] = useState<number>();
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();
	const { loginAddress } = useUserDetailsSelector();
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);

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
			// const ratingData = postData?.progress_report?.[0]?.ratings;
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
		setAverageRating(postData?.progress_report?.[0]?.ratings?.reduce((sum: number, current: IRating) => sum + current.rating, 0) / postData?.progress_report?.[0]?.ratings?.length);
	};

	useEffect(() => {
		getRatingInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postData?.progress_report]);

	const renderStars = () => {
		if (averageRating) {
			const fullStars = Math.floor(averageRating);
			const halfStar = averageRating % 1 >= 0.5 ? 1 : 0;
			const totalStars = fullStars + halfStar;

			const starsArray = [];

			for (let i = 0; i < fullStars; i++) {
				starsArray.push(
					<StarFilled
						key={i}
						style={{ color: '#fadb14' }}
						className='scale-110'
					/>
				);
			}

			if (halfStar) {
				starsArray.push(
					<StarFilled
						key='half'
						style={{ color: '#fadb14', opacity: 0.5 }}
						className='scale-110'
					/>
				);
			}

			// Fill up the remaining stars to always show a total of 5 stars
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

		// Default case when there's no rating
		return Array.from({ length: 5 }, (_, i) => (
			<StarFilled
				key={i}
				style={{ color: '#d9d9d9' }}
			/>
		));
	};

	return (
		<>
			<section className='flex flex-col gap-y-3'>
				<header className='flex items-center justify-start gap-x-1'>
					<NameLabel
						defaultAddress={postData?.proposer || ''}
						truncateUsername
						usernameClassName='text-xs text-ellipsis text-sidebarBlue overflow-hidden font-normal dark:text-blue-dark-medium'
					/>
					<Divider
						className='hidden dark:border-separatorDark md:inline-block'
						type='vertical'
						style={{ borderLeft: '1px solid var(--sidebarBlue)' }}
					/>
					<ClockCircleOutlined className='dark:text-icon-dark-inactive' />
					<p className='m-0 p-0 text-xs text-sidebarBlue dark:text-icon-dark-inactive'>{dayjs(postData?.progress_report?.[0]?.created_at).format('DD MMM YYYY')}</p>
					{(postData?.progress_report?.[0]?.isEdited || is_summary_edited) && (
						<p className='m-0 ml-auto mt-1 p-0 text-[10px] text-sidebarBlue dark:text-blue-dark-medium'>(Edited)</p>
					)}
				</header>
				<article className='flex flex-col gap-y-1'>
					<h1 className='m-0 p-0 text-base font-semibold text-sidebarBlue dark:text-white'>{postData?.title}</h1>
					{postData?.progress_report?.[0]?.progress_summary && (
						<p className='m-0 mt-1 p-0 text-sm text-bodyBlue dark:text-white'>
							<Markdown
								className='post-content m-0 p-0'
								md={postData?.progress_report?.[0]?.progress_summary}
								theme={theme}
							/>
						</p>
					)}
					{postData?.progress_report?.[0]?.ratings?.length > 0 && (
						<p className='m-0 flex items-center p-0 text-xs text-sidebarBlue dark:text-blue-dark-medium'>
							Average Rating({postData?.progress_report?.[0]?.ratings?.length}): <div className='ml-2 flex'>{renderStars()}</div>
						</p>
					)}
					<div className='mt-2 flex flex-col gap-y-3 rounded-md border border-solid border-[#D2D8E0] p-4 dark:border-[#3B444F]'>
						<iframe
							src={`https://docs.google.com/viewer?url=${encodeURIComponent(postData?.progress_report?.[0]?.progress_file)}&embedded=true`}
							width='100%'
							height='180px'
							title='PDF Preview'
							className='rounded-md border border-white bg-white dark:border-[#3B444F] dark:bg-black'
						></iframe>
						<div className='flex items-center justify-start gap-x-2'>
							<div className='flex h-[32px] w-[32px] items-center justify-center rounded-md bg-[#F9173E]'>
								<ImageIcon
									src='/assets/icons/pdf-icon.svg'
									alt='pdf.icon'
								/>
							</div>
							<p className='m-0 p-0 text-xs capitalize text-sidebarBlue dark:text-blue-dark-medium '>{`Progress Report - ${postData?.postType.replaceAll(
								'_',
								' '
							)} - ${postData?.postIndex}`}</p>
						</div>
					</div>
				</article>
				<Button
					className='m-0 -mb-3 flex items-center justify-start gap-x-1 border-none bg-transparent p-0 text-sm font-semibold text-pink_primary'
					onClick={() => {
						if (loginAddress) {
							dispatch(progressReportActions.setOpenRatingModal(true));
						} else {
							setLoginOpen(true);
						}
					}}
				>
					<StarFilled />
					<p className='m-0 p-0'>Rate Delievery</p>
				</Button>
			</section>
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
				footer={null}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={() => {
					dispatch(progressReportActions.setOpenRatingSuccessModal(false));
				}}
			>
				<RatingSuccessModal />
			</Modal>
		</>
	);
};

export default ProgressReportInfo;
