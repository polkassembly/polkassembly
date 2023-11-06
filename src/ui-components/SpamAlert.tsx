// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { WarningMessageIcon } from './CustomIcons';
import { usePostDataContext } from '~src/context';

interface ISpamAlertProps {}

const SpamAlert: FC<ISpamAlertProps> = () => {
	const { postData } = usePostDataContext();
	if (!postData.spam_users_count) return null;
	return (
		<div className='mb-[26.66px] flex flex-col gap-2 rounded-[14px] bg-[#FFFBEC] p-[24.15px] shadow-[0px_6px_18px_rgba(0,0,0,0.06)] md:flex-row md:items-center md:justify-between'>
			<div className='flex items-center gap-x-2'>
				<WarningMessageIcon className='text-xl text-[#FFA012]' />
				<h4 className='m-0 p-0 text-lg font-medium leading-[27px] tracking-[0.01em] text-sidebarBlue'>This post could be a spam.</h4>
			</div>
			<p className='m-0 p-0 text-base font-medium leading-[24px] tracking-[0.01em] text-navBlue'>Flagged by {postData.spam_users_count} users</p>
		</div>
	);
};

export default SpamAlert;
