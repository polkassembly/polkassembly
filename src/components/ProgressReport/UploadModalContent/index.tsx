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
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import SuccessModal from './SuccessModal';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { usePostDataContext } from '~src/context';
import ImageIcon from '~src/ui-components/ImageIcon';
import { UploadProps } from 'antd';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { IUploadResponseType } from 'pages/api/v1/progressReport/uploadReport';
import Markdown from '~src/ui-components/Markdown';
import { useTheme } from 'next-themes';
import SummaryContentForm from '~src/components/SummaryContentForm';
import { useTranslation } from 'next-i18next';

const { Dragger } = Upload;

const UploadModalContent = () => {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(false);
	const [canUpload, setCanUpload] = useState(true);
	const { postData } = usePostDataContext();
	const { resolvedTheme: theme } = useTheme();
	const { t } = useTranslation('common');

	const { postIndex } = postData;
	const { report_uploaded, add_summary_cta_clicked, open_success_modal, is_summary_edited, summary_content, progress_report_link } = useProgressReportSelector();
	const { id } = useUserDetailsSelector();

	useEffect(() => {
		if (postData?.progress_report?.progress_file) {
			dispatch(progressReportActions.setSummaryContent(postData?.progress_report?.progress_summary || ''));
			dispatch(progressReportActions.setProgressReportLink(postData?.progress_report?.progress_file || ''));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postData?.progress_report?.progress_file]);

	const checkAndRestoreProgressReport = () => {
		const progress_report = JSON.parse(localStorage.getItem('progress_report') || '{}');
		if (progress_report.post_id === postIndex && progress_report.user_id === id) {
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
		if (!file) return '';
		let sharableLink = '';

		try {
			setIsLoading(true);
			const formData = new FormData();
			formData.append('media', file);
			formData.append('postIndex', postData?.postIndex as any);
			formData.append('postType', postData?.postType);
			const { data, error } = await nextApiClientFetch<IUploadResponseType>('/api/v1/progressReport/uploadReport', formData);
			setIsLoading(false);
			if (data) {
				sharableLink = data.displayUrl;
			} else {
				console.error('Upload error:', error);
			}
		} catch (err) {
			setIsLoading(false);
			console.error('Unexpected error:', err);
		}
		return sharableLink;
	};

	const handleReplace = async () => {
		setIsLoading(true);
		try {
			const { data, error } = await nextApiClientFetch<{ message: string }>('/api/v1/progressReport/removeReport');
			if (data) {
				message.success(t('remove_file_success'));
				dispatch(progressReportActions.setReportUploaded(false));
				setCanUpload(true);
			} else {
				console.error('Error removing last uploaded file:', error);
				message.error(t('remove_file_fail'));
				setCanUpload(false);
			}
		} catch (error) {
			console.error('Unexpected error:', error);
			message.error(t('unexpected_error'));
			setCanUpload(false);
		} finally {
			setIsLoading(false);
		}
	};

	const props: UploadProps = {
		action: window.location.href,
		customRequest: async ({ file, onSuccess, onError }) => {
			if (!canUpload) {
				message.error(t('remove_file_prompt'));
				return;
			}
			try {
				setIsLoading(true);
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
			} finally {
				setIsLoading(false);
			}
		},
		disabled: isLoading || !canUpload,
		multiple: false,
		name: 'file',
		onChange(info) {
			const { status } = info.file;
			if (status === 'done') {
				dispatch(progressReportActions.setReportUploaded(true));
				message.success(t('upload_success', { name: info.file.name }));
			} else if (status === 'error') {
				message.error(t('upload_fail', { name: info.file.name }));
			}
		},
		onDrop() {}
	};

	return (
		<article className='mt-[6px] flex flex-col gap-y-1'>
			{!report_uploaded && !postData?.progress_report && (
				<Alert
					className='mb-4 mt-4 dark:border-infoAlertBorderDark dark:bg-infoAlertBgDark'
					showIcon
					type='info'
					message={<span className='dark:text-blue-dark-high'>{t('progress_report_pending')}</span>}
				/>
			)}
			{postData?.progress_report?.progress_file && (
				<div className='flex flex-col'>
					<p className='m-0 flex items-center p-0 text-sm text-bodyBlue dark:text-blue-dark-medium'>
						<Markdown
							className='post-content'
							md={postData?.progress_report?.progress_summary}
							theme={theme}
						/>
					</p>
					<div className='-mt-2 flex items-center justify-between gap-x-1'>
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
							{postData?.progress_report?.progress_summary ? t('edit_summary') : t('add_summary')}
						</Button>
						{(postData?.progress_report?.isEdited || is_summary_edited) && <p className='m-0 ml-auto mt-1 p-0 text-[10px] text-sidebarBlue dark:text-blue-dark-medium'>(Edited)</p>}
					</div>
				</div>
			)}
			{!postData?.progress_report?.progress_file && (
				<div className='flex items-center justify-start gap-x-2'>
					<p className='m-0 p-0 text-sm text-bodyBlue dark:text-blue-dark-medium'>{t('update_progress_report')}</p>
					{report_uploaded && !postData?.progress_report?.progress_file && (
						<Button
							className='m-0 border-none bg-transparent p-0 text-sm text-pink_primary'
							onClick={() => {
								dispatch(progressReportActions.setAddSummaryCTAClicked(true));
							}}
						>
							<PlusCircleOutlined className='m-0 p-0' /> {t('add_summary')}
						</Button>
					)}
				</div>
			)}
			{!report_uploaded && !postData?.progress_report?.progress_file && (
				<a
					href='https://docs.google.com/document/d/1jcHt-AJXZVqyEd9qCI3aMMF9_ZjKXcSk7BDTaP3m9i0/edit#heading=h.te0u4reg87so'
					target='_blank'
					className='-mt-2 flex cursor-pointer items-center justify-start gap-x-2'
					rel='noreferrer'
				>
					<p className='m-0 p-0 text-sm text-pink_primary'>{t('view_template')}</p>
					<Button className='m-0 border-none bg-transparent p-0 text-sm text-pink_primary'>
						<ExportOutlined className='m-0 p-0' />
					</Button>
				</a>
			)}
			{add_summary_cta_clicked && (
				<SummaryContentForm
					onChange={(content: string) => {
						dispatch(progressReportActions.setSummaryContent(content));
						const progress_report = JSON.parse(localStorage.getItem('progress_report') || '{}');
						progress_report.summary = content;
						localStorage.setItem('progress_report', JSON.stringify(progress_report));
					}}
					autofocus={true}
					height={200}
					value={summary_content || ''}
				/>
			)}
			{!report_uploaded && !postData?.progress_report?.progress_file ? (
				<Dragger {...props}>
					<div className='flex flex-row items-center justify-center gap-x-3'>
						<ImageIcon
							src='/assets/icons/upload-icon.svg'
							alt='upload-icon'
						/>
						<div className='flex flex-col items-start justify-start gap-y-2'>
							<p className='ant-upload-text m-0 p-0 text-base text-bodyBlue dark:text-white'>{isLoading ? t('uploading') : t('upload')}</p>
							<p className='ant-upload-hint m-0 p-0 text-sm text-bodyBlue dark:text-blue-dark-medium'>{t('drag_drop_files')}</p>
						</div>
					</div>
				</Dragger>
			) : (
				<div className='flex flex-col gap-y-3 rounded-md border border-solid border-[#D2D8E0] p-4 dark:border-[#3B444F]'>
					<iframe
						src={`https://docs.google.com/viewer?url=${encodeURIComponent(progress_report_link || postData?.progress_report?.progress_file)}&embedded=true`}
						width='100%'
						height='180px'
						title='PDF Preview'
						className='rounded-md border border-white bg-white dark:border-[#3B444F] dark:bg-black'
					></iframe>
					<div className='flex items-center justify-between gap-x-2'>
						<div className='flex items-center gap-x-1'>
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
						{!postData?.progress_report?.progress_file && (
							<div
								className='flex cursor-pointer items-center justify-end'
								onClick={() => {
									dispatch(progressReportActions.setReportUploaded(false));
									handleReplace();
								}}
							>
								<ImageIcon
									src='/assets/icons/pink_edit_icon.svg'
									alt='edit-icon'
								/>
								<p className='m-0 p-0 text-sm text-pink_primary'>{t('replace')}</p>
							</div>
						)}
					</div>
				</div>
			)}
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				className={classNames(poppins.className, poppins.variable, 'mt-[100px] w-[600px]')}
				open={open_success_modal}
				maskClosable={false}
				footer={null}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={() => {
					dispatch(progressReportActions.setShowNudge(false));
					dispatch(progressReportActions.setOpenSuccessModal(false));
				}}
			>
				<SuccessModal />
			</Modal>
		</article>
	);
};

export default UploadModalContent;
