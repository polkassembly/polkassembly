// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useState } from 'react';
import { sortValues } from 'src/global/sortOptions';
import styled from 'styled-components';
import { OffChainProposalType } from '~src/global/proposalType';
import OffChainPostsListingContainer from './OffChainPostsListingContainer';
import FilterByTags from '~src/ui-components/FilterByTags';
import FilteredTags from '~src/ui-components/filteredTags';
import SortByDropdownComponent from '~src/ui-components/SortByDropdown';

interface IOffChainContainerProps {
	posts: any[];
	className?: string;
	count: number;
	proposalType: OffChainProposalType;
	defaultPage?: number;
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

const OffChainPostsContainer: FC<IOffChainContainerProps> = ({ posts, className, count, proposalType, defaultPage }) => {
	const [sortBy, setSortBy] = useState<string>(sortValues.COMMENTED);

	return (
		<div className={`${className} rounded-[14px] bg-white shadow-[0px_6px_18px_rgba(0,0,0,0.06)] dark:bg-section-dark-overlay xs:px-0 xs:py-3 md:p-0`}>
			<div className='flex items-center justify-between py-5 align-middle'>
				<div className='mx-1 xs:mt-1 sm:mx-12 sm:mt-3'>
					<FilteredTags />
				</div>
				<div className='flex'>
					<FilterByTags className='mr-2 xs:mt-1 sm:mt-0.5' />
					<SortByDropdownComponent
						sortBy={sortBy}
						setSortBy={setSortBy}
					/>
				</div>
			</div>
			<OffChainPostsListingContainer
				proposalType={proposalType}
				sortBy={sortBy}
				count={count}
				posts={posts}
				className=''
				defaultPage={defaultPage}
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
