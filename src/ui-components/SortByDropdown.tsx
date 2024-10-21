// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { useRouter } from 'next/router';
import { Dropdown } from '~src/ui-components/Dropdown';
import { SwapOutlined } from '@ant-design/icons';
import { sortOptions } from 'src/global/sortOptions';
import { Divider } from 'antd';
import styled from 'styled-components';
import { poppins } from 'pages/_app';
import { useTranslation } from 'react-i18next';

interface SortByDropdownProps {
	theme?: string | undefined;
	sortBy: any;
	setSortBy: any;
	isUsedInTrackListing?: boolean;
	className?: string;
}

const SortByDropdownComponent: React.FC<SortByDropdownProps> = ({ setSortBy, sortBy, isUsedInTrackListing, className }) => {
	const router = useRouter();
	const { t } = useTranslation('common');

	const dropdownMenu = (
		<div className={`${poppins.className} ${poppins.variable} rounded-xl bg-white dark:bg-[#282A2D]`}>
			<div
				onClick={() => handleSortByClick('clear_filter')}
				className='pt-3'
			>
				{sortBy && (
					<div className='flex justify-end'>
						<span className='my-1 mr-2 cursor-pointer text-[10px] text-pink_primary'>{t('clear_filters')}</span>
					</div>
				)}
				<Divider
					style={{ background: '#D2D8E0', flexGrow: 1 }}
					className='mb-1 mt-0 dark:bg-separatorDark'
				/>
			</div>
			<div className='mb-2'>
				{sortOptions.map((option) => (
					<div
						key={option.key}
						onClick={() => handleSortByClick(option.key)}
						className={`cursor-pointer px-4 py-2 text-xs ${sortBy === option.key && 'text-pink_primary'} hover:text-pink_primary`}
					>
						{option.label}
					</div>
				))}
			</div>
		</div>
	);

	const handleSortByClick = (key: string) => {
		if (key === 'clear_filter') {
			router.push({ pathname: '' });
			setSortBy(null);
		} else {
			router.push({
				pathname: '',
				query: { ...router.query, sortBy: key }
			});
			setSortBy(key);
		}
	};

	return (
		<Dropdown
			overlay={dropdownMenu}
			trigger={['hover']}
			className={`${className} ${poppins.className} ${poppins.variable}`}
		>
			<div className='dropdown-div flex cursor-pointer items-center whitespace-pre rounded px-2 py-1 text-xs font-normal text-bodyBlue opacity-70 dark:text-[#96A4B6] dark:opacity-100'>
				<span className='sm:mr-1 sm:mt-0.5'>{t('sort_by')}</span>
				<SwapOutlined
					className={`${isUsedInTrackListing ? 'text-bodyBlue opacity-70 dark:text-[#96A4B6]' : ''}`}
					rotate={90}
					style={{ fontSize: '12px', marginRight: '10px' }}
				/>
			</div>
		</Dropdown>
	);
};

export default styled(SortByDropdownComponent)`
	.ant-dropdown-menu .ant-dropdown-menu-root .ant-dropdown-menu-vertical .ant-dropdown-menu-light {
		padding: 4px 0 !important;
	}
`;
