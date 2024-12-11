// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal } from 'antd';
import React, { FC, useState } from 'react';
import RatingSuccessModal from '~src/components/ProgressReport/RatingModal/RatingSuccessModal';
import RatingModal from '~src/components/ProgressReport/RatingModal';
import { dmSans } from 'pages/_app';
import { useProgressReportSelector } from '~src/redux/selectors';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { progressReportActions } from '~src/redux/progressReport';
import { StarFilled } from '@ant-design/icons';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import queueNotification from './QueueNotification';
import { IProgressReport, NotificationStatus } from '~src/types';
import { getFirestoreProposalType, ProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { usePostDataContext } from '~src/context';

interface IRateModal {
	reports?: IProgressReport[];
	index?: string | number | null | undefined;
	open?: boolean;
	setRateModal?: (pre: boolean) => void;
	proposalType?: ProposalType | string;
}

const RateModal: FC<IRateModal> = (props) => {
	const { reports, index, proposalType, open, setRateModal } = props;
	const [loading, setLoading] = useState<boolean>(false);
	const { open_rating_success_modal, report_rating } = useProgressReportSelector();
	const dispatch = useDispatch();
	const { setPostData } = usePostDataContext();
	const addUserRating = async () => {
		setLoading(true);
		const type = getFirestoreProposalType(proposalType as ProposalType);
		const { data, error: editError } = await nextApiClientFetch<any>('api/v1/progressReport/addReportRating', {
			postId: index,
			proposalType: type,
			rating: report_rating,
			reportId: reports?.[0]?.id
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
			setPostData((prev) => ({
				...prev,
				progress_report
			}));
			setRateModal?.(false);
			dispatch(progressReportActions.setOpenRatingSuccessModal(true));
		} else {
			console.log('failed to save rating');
		}
	};

	return (
		<>
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				className={`${dmSans.variable} ${dmSans.className} ant-modal-content>.ant-modal-header]:bg-section-dark-overlay max-w-full shrink-0 max-sm:w-[100%] md:w-[600px]`}
				open={open}
				footer={
					<div className='-mx-6 mt-9 flex items-center justify-end gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-2 pt-6'>
						<CustomButton
							variant='default'
							text='Cancel'
							buttonsize='sm'
							disabled={loading}
							onClick={() => {
								setRateModal?.(false);
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
				closeIcon={<CloseIcon className='mt-2 text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={(e) => {
					e.stopPropagation();
					e.preventDefault();
					setRateModal?.(false);
				}}
				title={
					<div className='-mx-6 flex items-center justify-start border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-5 text-lg tracking-wide text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
						<StarFilled className='mr-2' />
						Rate Delivery of Progress Report
					</div>
				}
			>
				<RatingModal reportId={reports?.[0]?.id} />
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
				<RatingSuccessModal reportId={reports?.[0]?.id} />
			</Modal>
		</>
	);
};

export default RateModal;
