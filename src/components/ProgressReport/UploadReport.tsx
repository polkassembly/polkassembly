// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal } from 'antd';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import React from 'react';
import { useDispatch } from 'react-redux';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { progressReportActions } from '~src/redux/progressReport';
import { useProgressReportSelector } from '~src/redux/selectors';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import ImageIcon from '~src/ui-components/ImageIcon';
import Skeleton from '~src/basic-components/Skeleton';
import dynamic from 'next/dynamic';
const UploadModalContent = dynamic(() => import('./UploadModalContent'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const UploadReport = () => {
	const { add_progress_report_modal_open, report_uploaded } = useProgressReportSelector();
	const dispatch = useDispatch();

	return (
		<Modal
			wrapClassName='dark:bg-modalOverlayDark'
			className={classNames(poppins.className, poppins.variable, 'w-[600px]')}
			open={add_progress_report_modal_open}
			footer={
				<div className='-mx-6 mt-9 flex items-center justify-end gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-2 pt-6'>
					<CustomButton
						variant='default'
						text='Cancel'
						buttonsize='sm'
						disabled={!report_uploaded}
						onClick={() => {
							dispatch(progressReportActions.setAddProgressReportModalOpen(false));
						}}
					/>
					<CustomButton
						variant='primary'
						text='Done'
						buttonsize='sm'
						disabled={!report_uploaded}
						onClick={() => {
							// dispatch(progressReportActions.setPostReportAdded(true));
							dispatch(progressReportActions.setAddProgressReportModalOpen(false));
						}}
					/>
				</div>
			}
			maskClosable={false}
			closeIcon={<CloseIcon className='mt-2 text-lightBlue dark:text-icon-dark-inactive' />}
			onCancel={() => {
				dispatch(progressReportActions.setAddProgressReportModalOpen(false));
			}}
			title={
				<div className='-mx-6 flex items-center justify-start border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-5 text-lg tracking-wide text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
					<ImageIcon
						src='/assets/icons/cloud-upload.svg'
						alt='upload-icon'
						imgClassName='mr-2'
					/>
					Upload Progress Report{' '}
				</div>
			}
		>
			<UploadModalContent />
		</Modal>
	);
};

export default UploadReport;
