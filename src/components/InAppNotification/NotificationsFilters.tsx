// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { ECustomNotificationFilters, INotificationsFilters } from './types';
import classNames from 'classnames';
import { ClipboardIcon, CommentsIcon, ProfileMentionsIcon } from '~src/ui-components/CustomIcons';
import styled from 'styled-components';
import { useInAppNotificationsSelector } from '~src/redux/selectors';
import { useRouter } from 'next/router';

const getFiltersIcon = (filter: ECustomNotificationFilters) => {
	switch (filter) {
		case ECustomNotificationFilters.ALL:
			return null;
		case ECustomNotificationFilters.COMMENTS:
			return <CommentsIcon className='text-[15px] text-lightBlue dark:text-icon-dark-inactive' />;
		case ECustomNotificationFilters.MENTIONS:
			return <ProfileMentionsIcon className='text-[17px] text-lightBlue dark:text-icon-dark-inactive' />;
		case ECustomNotificationFilters.PROPOSALS:
			return <ClipboardIcon className='text-[17px] text-lightBlue dark:text-icon-dark-inactive' />;
	}
};

const NotificationsFilters = ({ className, inPage, onChange }: INotificationsFilters) => {
	const router = useRouter();
	const { popupActiveFilter } = useInAppNotificationsSelector();
	const activeFilter = inPage ? (router?.query?.filter as ECustomNotificationFilters) || ECustomNotificationFilters.ALL : popupActiveFilter;
	const isMobile = (typeof window !== 'undefined' && window.screen.width < 1024) || false;

	return (
		<div
			className={classNames(
				className,
				'flex rounded-sm border-[1px] border-solid border-section-light-container px-3 py-1.5 dark:border-section-dark-container',
				inPage ? (isMobile ? 'w-full justify-between' : 'w-[500px] justify-between text-sm') : 'justify-between text-xs'
			)}
		>
			{['all', 'comments', 'mentions', 'proposals'].map((value) => (
				<div
					className={classNames(
						'flex cursor-pointer items-center gap-1 py-1 font-medium capitalize text-lightBlue dark:text-blue-dark-medium',
						activeFilter === value ? 'rounded-md bg-[#fdedf7] dark:bg-[#451b30] dark:text-pink_primary' : '',
						isMobile ? 'px-1' : 'px-3.5'
					)}
					key={value}
					onClick={() => onChange(value as ECustomNotificationFilters)}
				>
					<span className={classNames(activeFilter === value ? 'pink-icon' : '', 'hidden items-center msm:flex')}>{getFiltersIcon(value as ECustomNotificationFilters)}</span>
					<span> {value}</span>
				</div>
			))}
		</div>
	);
};

export default styled(NotificationsFilters)`
	.pink-icon {
		filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
	}
`;
