// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { WarningMessageIcon } from './CustomIcons';
import { usePostDataContext } from '~src/context';
import { useTranslation } from 'next-i18next';

interface ISpamAlertProps {}

const SpamAlert: FC<ISpamAlertProps> = () => {
	const { postData } = usePostDataContext();
	const { t } = useTranslation('common');

	if (!postData.spam_users_count) return null;
	return (
		<div className='mb-[26.66px] flex flex-col gap-2 rounded-[14px] bg-[#FFFBEC] p-[24.15px] shadow-[0px_6px_18px_rgba(0,0,0,0.06)] dark:border-warningAlertBorderDark dark:bg-warningAlertBgDark md:flex-row md:items-center md:justify-between'>
			<div className='flex items-center gap-x-2'>
				<WarningMessageIcon className='text-xl text-[#FFA012]' />
				<h4 className='m-0 p-0 text-lg font-medium leading-[27px] tracking-[0.01em] text-sidebarBlue dark:text-blue-dark-high'>{t('this_post_could_be_a_spam')}</h4>
			</div>
			<p className='m-0 p-0 text-base font-medium leading-[24px] tracking-[0.01em] text-lightBlue dark:text-navBlue'>
				{t('Flagged by')} {postData.spam_users_count} {t('users')}
			</p>
		</div>
	);
};

export default SpamAlert;
