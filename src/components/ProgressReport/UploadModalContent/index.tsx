// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Modal, message, Upload } from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
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
import { usePostDataContext } from '~src/context';
import ImageIcon from '~src/ui-components/ImageIcon';
import { UploadProps } from 'antd';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { IUploadResponseType } from 'pages/api/v1/progressReport/uploadReport';
import Markdown from '~src/ui-components/Markdown';
import { useTheme } from 'next-themes';

const { Dragger } = Upload;

const UploadModalContent = () => {
	const dispatch = useDispatch();
	const [fileLink, setFileLink] = useState<string>('');
	const [fileName, setFileName] = useState<string>('');
	const [summary, setSummary] = useState<string>('');
	const { postData } = usePostDataContext();
	const { resolvedTheme: theme } = useTheme();

	const { postIndex } = postData;
	const { report_uploaded, add_summary_cta_clicked, open_success_modal, is_summary_edited } = useProgressReportSelector();
	const { id } = useUserDetailsSelector();

	useEffect(() => {
		if (postData?.progress_report?.progress_file) {
			setSummary(postData?.progress_report?.progress_summary || '');
			dispatch(progressReportActions.setSummaryContent(postData?.progress_report?.progress_summary || ''));
			dispatch(progressReportActions.setProgressReportLink(postData?.progress_report?.progress_file || ''));
		}
	}, [postData?.progress_report?.progress_file, postData, dispatch]);

	const checkAndRestoreProgressReport = () => {
		const progress_report = JSON.parse(localStorage.getItem('progress_report') || '{}');
		if (progress_report.post_id === postIndex && progress_report.user_id === id) {
			setFileLink(progress_report.url);
			setFileName(progress_report.url.split('/').pop());
			setSummary(progress_report.summary);
			dispatch(progressReportActions.setProgressReportLink(progress_report.url));
			dispatch(progressReportActions.setReportUploaded(true));
			dispatch(progressReportActions.setSummaryContent(progress_report.summary));
		}
	};

	useEffect(() => {
		checkAndRestoreProgressReport();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postIndex, id]);

	const handleUpload = async (file: File) => {
		dispatch(progressReportActions.setFileName(file.name));
		if (!file) return '';
		let sharableLink = '';

		try {
			const formData = new FormData();
			formData.append('media', file);
			const { data, error } = await nextApiClientFetch<IUploadResponseType>('/api/v1/progressReport/uploadReport', formData);
			if (data) {
				setFileLink(data?.displayUrl);
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
				const sharableLink = await handleUpload(file as File);
				if (sharableLink) {
					dispatch(progressReportActions.setProgressReportLink(sharableLink));
					const progress_report = {
						post_id: postIndex,
						proposalType: postData?.postType,
						summary: '',
						url: sharableLink,
						user_id: id
					};

					localStorage.setItem('progress_report', JSON.stringify(progress_report));
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
				setFileName(info.file.name);
				dispatch(progressReportActions.setReportUploaded(true));
				message.success(`${info.file.name} file uploaded successfully.`);
			} else if (status === 'error') {
				message.error(`${info.file.name} file upload failed.`);
			}
		},
		onDrop() {}
	};

	return (
		<article className='mt-2 flex flex-col gap-y-1'>
			{!report_uploaded && (
				<Alert
					className='mb-4 mt-4 dark:border-infoAlertBorderDark dark:bg-infoAlertBgDark'
					showIcon
					type='info'
					message={<span className='dark:text-blue-dark-high'>Progress Report Pending!</span>}
				/>
			)}
			<div className='flex items-center justify-start gap-x-2'>
				<p className='m-0 p-0 text-sm text-bodyBlue dark:text-white'>Please update your progress report for users to rate it.</p>
				{report_uploaded && !postData?.progress_report?.progress_file && (
					<Button
						className='m-0 border-none bg-transparent p-0 text-sm text-pink_primary'
						onClick={() => {
							dispatch(progressReportActions.setAddSummaryCTAClicked(true));
						}}
					>
						<PlusCircleOutlined className='m-0 p-0' /> Add summary
					</Button>
				)}
				{postData?.progress_report?.progress_file && (
					<Button
						className='m-0 -mt-0.5 flex items-center gap-x-1 border-none bg-transparent p-0 text-sm text-pink_primary'
						onClick={() => {
							dispatch(progressReportActions.setAddSummaryCTAClicked(true));
						}}
					>
						<ImageIcon
							src='/assets/icons/edit-pencil.svg'
							alt='edit-icon'
						/>{' '}
						Edit summary
					</Button>
				)}
				{(postData?.progress_report?.isEdited || is_summary_edited) && <p className='m-0 ml-auto mt-1 p-0 text-[10px] text-sidebarBlue dark:text-[#909090]'>(Edited)</p>}
			</div>
			{!report_uploaded && (
				<a
					href='https://docs.google.com/document/d/1jcHt-AJXZVqyEd9qCI3aMMF9_ZjKXcSk7BDTaP3m9i0/edit#heading=h.te0u4reg87so'
					target='_blank'
					className='-mt-2 flex cursor-pointer items-center justify-start gap-x-2'
					rel='noreferrer'
				>
					<p className='m-0 p-0 text-sm text-pink_primary'>View Template for making a Progress Report</p>
					<Button className='m-0 border-none bg-transparent p-0 text-sm text-pink_primary'>
						<ExportOutlined className='m-0 p-0' />
					</Button>
				</a>
			)}
			{add_summary_cta_clicked && (
				<ContentForm
					onChange={(content: string) => {
						setSummary(content);
						dispatch(progressReportActions.setSummaryContent(content));
						const progress_report = JSON.parse(localStorage.getItem('progress_report') || '{}');
						progress_report.summary = content;
						localStorage.setItem('progress_report', JSON.stringify(progress_report));
					}}
					height={200}
					value={summary}
				/>
			)}
			{!report_uploaded && !postData?.progress_report?.progress_file ? (
				<Dragger {...props}>
					<div className='flex flex-row items-center justify-center gap-x-3'>
						<p className='ant-upload-drag-icon'>
							<ImageIcon
								src='/assets/icons/upload-icon.svg'
								alt='upload-icon'
							/>
						</p>
						<div className='flex flex-col items-start justify-start gap-y-2'>
							<p className='ant-upload-text m-0 p-0 text-base text-bodyBlue dark:text-white'>Upload</p>
							<p className='ant-upload-hint m-0 p-0 text-sm text-bodyBlue dark:text-white'>Drag and drop your files here.</p>
						</div>
					</div>
				</Dragger>
			) : (
				<div className='flex flex-col gap-y-3 rounded-md border border-solid border-[#D2D8E0] p-4'>
					<iframe
						src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileLink)}&embedded=true`}
						width='100%'
						height='180px'
						title='PDF Preview'
						className='rounded-md border border-white'
					></iframe>
					<div className='flex items-center justify-between gap-x-2'>
						<div className='flex items-center gap-x-1'>
							<div className='flex h-[32px] w-[32px] items-center justify-center rounded-md bg-[#F9173E]'>
								<ImageIcon
									src='/assets/icons/pdf-icon.svg'
									alt='pdf.icon'
								/>
							</div>
							<p className='m-0 p-0 text-xs text-sidebarBlue dark:text-white'>{fileName?.length > 20 ? `${fileName?.slice(0, 20)}` : fileName}</p>
						</div>
						{!postData?.progress_report?.progress_file && (
							<div
								className='flex cursor-pointer items-center justify-end'
								onClick={() => {
									dispatch(progressReportActions.setReportUploaded(false));
								}}
							>
								<ImageIcon
									src='/assets/icons/pink_edit_icon.svg'
									alt='edit-icon'
								/>
								<p className='m-0 p-0 text-sm text-pink_primary'>Replace</p>
							</div>
						)}
					</div>
				</div>
			)}
			{postData?.progress_report?.progress_file && (
				<div className='mt-2 flex flex-col gap-y-1'>
					<h1 className='m-0 p-0 text-base font-semibold text-bodyBlue dark:text-white'>Summary: </h1>
					<p className='m-0 p-0 text-sm text-bodyBlue dark:text-[#909090]'>
						<Markdown
							className='post-content'
							md={postData?.progress_report?.progress_summary}
							theme={theme}
						/>
					</p>
				</div>
			)}
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
