// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Modal } from 'antd';
import React from 'react';
import { useDispatch } from 'react-redux';
import ImageIcon from '~src/ui-components/ImageIcon';
import type { UploadProps } from 'antd';
import { message, Upload } from 'antd';
import { PlusCircleOutlined, ExportOutlined } from '@ant-design/icons';
// import { PlusCircleOutlined, ExportOutlined, StarFilled } from '@ant-design/icons';
import { progressReportActions } from '~src/redux/progressReport';
import Alert from '~src/basic-components/Alert';
import { useProgressReportSelector } from '~src/redux/selectors';
import ContentForm from '~src/components/ContentForm';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import SuccessModal from './SuccessModal';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
// import RatingModal from '../RatingModal';

const { Dragger } = Upload;

const UploadModalContent = () => {
	const dispatch = useDispatch();
	const { post_report_added, report_uploaded, add_summary_cta_clicked, open_success_modal } = useProgressReportSelector();

	const handleUpload = async (file: File) => {
		if (!file) return '';

		const formData = new FormData();
		console.log(file);
		formData.append('media', file);
		console.log('form_data --> ', formData);
		try {
			console.log('form_data --> ', formData);
			const { data } = await nextApiClientFetch<any>('/api/v1/upload/upload', {
				data: formData
			});

			console.log(data, data.json());
			const sharableLink = data.displayUrl;

			// // Update the state with the uploaded file's sharable link if necessary
			// // You can dispatch an action or update a state variable with this link
			// console.log('File uploaded successfully:', sharableLink);
			// message.success(`${file.name} file uploaded successfully.`);

			return sharableLink;
		} catch (error) {
			message.error(`${file.name} file upload failed.`);
			console.error('Error uploading file:', error);
			return null;
		}
	};

	const props: UploadProps = {
		customRequest: async ({ file, onSuccess, onError }) => {
			const sharableLink = await handleUpload(file as File);
			console.log(sharableLink);
			// if (sharableLink) {
			// dispatch(progressReportActions.setReportUploaded(true));
			// onSuccess(sharableLink, file);
			// } else {
			// dispatch(progressReportActions.setReportUploaded(false));
			// onError(new Error('File upload failed'));
			// }
		},
		multiple: true,
		name: 'file',
		onChange(info) {
			const { status } = info.file;
			if (status !== 'uploading') {
				console.log(info.file, info.fileList);
			}
			if (status === 'done') {
				dispatch(progressReportActions.setReportUploaded(true));
				message.success(`${info.file.name} file uploaded successfully.`);
			} else if (status === 'error') {
				dispatch(progressReportActions.setReportUploaded(false));
				message.error(`${info.file.name} file upload failed.`);
			}
		},
		onDrop(e) {
			console.log('Dropped files', e.dataTransfer.files);
		}
	};
	return (
		<article className='mt-2 flex flex-col gap-y-1'>
			{/* NOTE: Push this progress report field in backend and use that field check in place of post_report_added */}
			{!post_report_added && (
				<Alert
					className='mb-4 mt-4 dark:border-infoAlertBorderDark dark:bg-infoAlertBgDark'
					showIcon
					type='info'
					message={<span className='dark:text-blue-dark-high'>Progress Report Pending!</span>}
				/>
			)}
			<div className='flex items-center justify-start gap-x-2'>
				<p className='m-0 p-0 text-sm text-bodyBlue dark:text-modalOverlayDark'>Please update your progress report for users to rate it.</p>
				{report_uploaded && (
					<Button
						className='m-0 border-none bg-transparent p-0 text-sm text-pink_primary'
						onClick={() => {
							dispatch(progressReportActions.setAddSummaryCTAClicked(true));
						}}
					>
						<PlusCircleOutlined className='m-0 p-0' /> Add summary
					</Button>
				)}
			</div>
			{!report_uploaded && (
				<div className='-mt-2 flex items-center justify-start gap-x-2'>
					<p className='m-0 p-0 text-sm text-pink_primary'>View Template for making a Progress Report</p>
					<Button className='m-0 border-none bg-transparent p-0 text-sm text-pink_primary'>
						<ExportOutlined className='m-0 p-0' />
					</Button>
				</div>
			)}
			{add_summary_cta_clicked && (
				<ContentForm
					onChange={(content: any) => {
						console.log(content);
						dispatch(progressReportActions.setSummaryContent(content));
					}}
					height={200}
				/>
			)}
			<Dragger {...props}>
				<div className='flex flex-row items-center justify-center gap-x-3'>
					<p className='ant-upload-drag-icon'>
						<ImageIcon
							src='/assets/icons/upload-icon.svg'
							alt='upload-icon'
						/>
					</p>
					<div className='flex flex-col items-start justify-start gap-y-2'>
						<p className='ant-upload-text m-0 p-0 text-base text-bodyBlue dark:text-section-dark-overlay'>Upload</p>
						<p className='ant-upload-hint m-0 p-0 text-sm text-bodyBlue dark:text-section-dark-overlay'>Drag and drop your files here.</p>
					</div>
				</div>
			</Dragger>
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				className={classNames(poppins.className, poppins.variable, 'mt-[100px] w-[600px]')}
				open={open_success_modal}
				maskClosable={false}
				footer={
					<CustomButton
						variant='primary'
						className='w-full'
						text='close'
						onClick={() => {
							dispatch(progressReportActions.setOpenSuccessModal(false));
						}}
					/>
				}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={() => {}}
			>
				<SuccessModal />
			</Modal>
			{/* <Modal
				wrapClassName='dark:bg-modalOverlayDark'
				className={classNames(poppins.className, poppins.variable, 'w-[600px]')}
				open={open_rating_modal}
				footer={
					<div className='-mx-6 mt-9 flex items-center justify-end gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-2 pt-6'>
						<CustomButton
							variant='default'
							text='Cancel'
							buttonsize='sm'
							disabled={!report_uploaded}
							onClick={() => {
								dispatch(progressReportActions.setOpenRatingModal(false));
							}}
						/>
						<CustomButton
							variant='primary'
							text='Rate'
							buttonsize='sm'
							disabled={!report_uploaded}
							onClick={() => {
								// dispatch(progressReportActions.setPostReportAdded(true));
								dispatch(progressReportActions.setOpenRatingModal(true));
								dispatch(progressReportActions.setOpenRatingSuccessModal(true));
								// dispatch(progressReportActions.setAddProgressReportModalOpen(false));
							}}
						/>
					</div>
				}
				maskClosable={false}
				closeIcon={<CloseIcon className='mt-2 text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={() => {
					// dispatch(progressReportActions.setAddProgressReportModalOpen(false));
				}}
				title={
					<div className='-mx-6 flex items-center justify-start border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-5 text-lg tracking-wide text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
						<StarFilled className='mr-2' />
						Rate Delivery of Progress Report
					</div>
				}
			>
				<RatingModal />
			</Modal> */}
		</article>
	);
};

export default UploadModalContent;
