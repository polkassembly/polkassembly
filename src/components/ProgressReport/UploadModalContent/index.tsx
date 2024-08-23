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

const { Dragger } = Upload;

const UploadModalContent = () => {
	const dispatch = useDispatch();
	const { report_uploaded, add_summary_cta_clicked, open_success_modal } = useProgressReportSelector();

	const handleUpload = async (file: File) => {
		dispatch(progressReportActions.setFileName(file.name));
		console.log('Handling file upload:', file);
		if (!file) return '';
		let sharableLink = '';

		try {
			const formData = new FormData();
			formData.append('media', file);
			const { data, error } = await nextApiClientFetch<any>('/api/v1/upload/upload', formData);
			if (data) {
				console.log('Upload successful:', data);
				sharableLink = data.displayUrl;
			} else {
				console.error('Upload error:', error);
			}
		} catch (err) {
			console.error('Unexpected error:', err);
		}
		return sharableLink;
	};

	const props: UploadProps = {
		action: window.location.href,
		customRequest: async ({ file, onSuccess, onError }) => {
			try {
				console.log('Starting file upload:', file);
				const sharableLink = await handleUpload(file as File);
				if (sharableLink) {
					dispatch(progressReportActions.setProgressReportLink(sharableLink));
					console.log('Upload success:', sharableLink);
					onSuccess?.({}, file as any);
				} else {
					console.error('Upload failed');
					dispatch(progressReportActions.setReportUploaded(false));
					onError?.(new Error('Upload failed'));
				}
			} catch (error) {
				console.error('Custom request error:', error);
				onError?.(error);
			}
		},
		multiple: false,
		name: 'file',
		onChange(info) {
			const { status } = info.file;
			if (status === 'done') {
				console.log('Upload done:', info.file.name);
				dispatch(progressReportActions.setReportUploaded(true));
				message.success(`${info.file.name} file uploaded successfully.`);
			} else if (status === 'error') {
				console.log('Upload error:', info.file.name);
				message.error(`${info.file.name} file upload failed.`);
			}
		},
		onDrop(e) {
			console.log('Dropped files:', e.dataTransfer.files);
		}
	};
	return (
		<article className='mt-2 flex flex-col gap-y-1'>
			{/* NOTE: Push this progress report field in backend and use that field check in place of report_uploaded */}
			{!report_uploaded && (
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
							dispatch(progressReportActions.setShowNudge(false));
							dispatch(progressReportActions.setOpenSuccessModal(false));
						}}
					/>
				}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={() => {}}
			>
				<SuccessModal />
			</Modal>
		</article>
	);
};

export default UploadModalContent;
