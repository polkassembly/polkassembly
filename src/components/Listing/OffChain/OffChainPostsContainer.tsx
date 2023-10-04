// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SwapOutlined } from '@ant-design/icons';
import { Dropdown } from '~src/ui-components/CustomDropdown';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useRouter } from 'next/router';
import React, { FC, useState } from 'react';
import { sortOptions, sortValues } from 'src/global/sortOptions';
import styled from 'styled-components';
import { OffChainProposalType } from '~src/global/proposalType';
import OffChainPostsListingContainer from './OffChainPostsListingContainer';
import FilterByTags from '~src/ui-components/FilterByTags';
import FilteredTags from '~src/ui-components/filteredTags';
import { useTheme } from 'next-themes';

interface IOffChainContainerProps {
	posts: any[];
	className?: string;
	count: number;
	proposalType: OffChainProposalType;
}

export function getTitle(proposalType: OffChainProposalType): string {
	switch (proposalType) {
		case OffChainProposalType.DISCUSSIONS:
			return 'Discussions';
		case OffChainProposalType.GRANTS:
			return 'Grants';
	}
	return '';
}

const OffChainPostsContainer: FC<IOffChainContainerProps> = ({ posts, className, count, proposalType }) => {
	const router = useRouter();
	const [sortBy, setSortBy] = useState<string>(sortValues.COMMENTED);
	const { resolvedTheme:theme } = useTheme();

	const handleSortByClick = ({ key }: { key: string }) => {
		router.push({
			pathname: '',
			query: { ...router.query, sortBy: key }
		});
		setSortBy(key);
	};

	const sortByOptions: ItemType[] = sortOptions;
	const sortByDropdown = (
		<Dropdown
			theme={theme}
			menu={{
				defaultSelectedKeys: [sortValues.COMMENTED],
				items: sortByOptions,
				onClick: handleSortByClick,
				selectable: true
			}}
<<<<<<< HEAD
			trigger={['click']}>
			<div className='dropdown-div text-pink_primary flex whitespace-pre items-center cursor-pointer hover:text-pink_primary py-1 px-2 rounded dark:text-blue-dark-helper'>
				<span className='sm:mr-1 sm:mt-0.5 font-normal'>Sort By</span>
				<SwapOutlined rotate={90} style={ { fontSize: '14px' , marginRight: '10px' } } />
=======
			trigger={['click']}
		>
			<div className='dropdown-div flex cursor-pointer items-center whitespace-pre rounded px-2 py-1 text-pink_primary hover:text-pink_primary'>
				<span className='font-normal sm:mr-1 sm:mt-0.5'>Sort By</span>
				<SwapOutlined
					rotate={90}
					style={{ fontSize: '14px', marginRight: '10px' }}
				/>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
			</div>
		</Dropdown>
	);

	return (
<<<<<<< HEAD
		<div className={`${className} bg-white dark:bg-section-dark-overlay xs:py-3 xs:px-0 md:p-0 rounded-[14px] shadow-[0px_6px_18px_rgba(0,0,0,0.06)]`}>
			<div className='flex items-center justify-between align-middle py-5'>
				<div className='xs:mt-1 mx-1 sm:mt-3 sm:mx-12'>
					<FilteredTags/>
=======
		<div className={`${className} rounded-[14px] bg-white shadow-[0px_6px_18px_rgba(0,0,0,0.06)] xs:px-0 xs:py-3 md:p-0`}>
			<div className='flex items-center justify-between py-5 align-middle'>
				<div className='mx-1 xs:mt-1 sm:mx-12 sm:mt-3'>
					<FilteredTags />
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
				</div>
				<div className='flex'>
					<FilterByTags className='mr-2 xs:mt-1 sm:mt-0.5' />
					{sortByDropdown}
				</div>
			</div>
			<OffChainPostsListingContainer
				proposalType={proposalType}
				sortBy={sortBy}
				count={count}
				posts={posts}
				className=''
			/>
		</div>
	);
};

export default styled(OffChainPostsContainer)`
	.ant-dropdown-trigger.ant-dropdown-open {
		color: pink_primary !important;
	}
	.text-color {
		color: #334d6e;
	}
`;
