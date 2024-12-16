// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';
import { ExportOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { progressReportActions } from '~src/redux/progressReport';
import { useRouter } from 'next/router';
import { usePostDataContext } from '~src/context';
import { useTranslation } from 'next-i18next';

const SuccessModal = () => {
	const dispatch = useDispatch();
	const { postData } = usePostDataContext();
	const router = useRouter();
	const { t } = useTranslation('common');

	return (
		<section className='h-[150px] p-6'>
			<ImageIcon
				src='/assets/icons/success-icon.svg'
				alt='success-icon'
				imgWrapperClassName='mx-auto relative -top-[152px] left-[150px]'
			/>
			<div className='-mt-[136px] flex flex-col items-center justify-center'>
				<h1 className='m-0 p-0 text-xl font-semibold text-bodyBlue dark:text-white'>{t('progress_report_added')}</h1>
				<p
					className='m-0 mb-4 mt-1 cursor-pointer p-0 text-sm font-normal text-pink_primary'
					onClick={() => {
						dispatch(progressReportActions.setOpenSuccessModal(false));
						if (postData?.postIndex) {
							router.push(`/referenda/${postData?.postIndex}?tab=evaluation`);
						}
					}}
				>
					{t('view_on_proposal_page')} <ExportOutlined className='m-0 p-0' />
				</p>
			</div>
		</section>
	);
};

export default SuccessModal;
