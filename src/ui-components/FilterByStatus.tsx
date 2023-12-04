// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Dropdown } from '~src/ui-components/Dropdown';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { bountyStatusOptions, childBountyStatusOptions, gov2ReferendumStatusOptions, motionStatusOptions, referendumStatusOptions, tipStatusOptions } from '~src/global/statuses';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { useNetworkSelector } from '~src/redux/selectors';
import DropdownGreyIcon from '~assets/icons/dropdown-grey.svg';
import DropdownPinkIcon from '~assets/icons/dropdown-pink.svg';
import { getProposalTypeFromSinglePostLink } from '~src/global/proposalType';
import { useTheme } from 'next-themes';
import { Divider } from 'antd';
import styled from 'styled-components';

interface SortByDropdownProps {
	theme?: string | undefined;
	setStatusItem?: any;
	className?: string;
}

const FilterByStatus: React.FC<SortByDropdownProps> = ({ setStatusItem, className }) => {
	const router = useRouter();
	const { resolvedTheme: theme } = useTheme();
	const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
	const { network } = useNetworkSelector();
	let path = router.pathname.split('/')[1];
	let statusOptions = isOpenGovSupported(network) ? gov2ReferendumStatusOptions : referendumStatusOptions;
	const clearFilterOption = {
		key: 'clear_filter',
		label: (
			<div>
				<div className='flex justify-end'>
					<span className='my-1 text-xs text-pink_primary'>Clear Filter</span>
				</div>
				<Divider
					style={{ background: '#D2D8E0', flexGrow: 1 }}
					className='my-2 dark:bg-separatorDark'
				/>
			</div>
		)
	};

	if (path === 'child_bounties') {
		path = 'child_bounty';
	} else if (path === 'bounties') {
		path = 'bounty';
	} else if (path === 'tips') {
		path = 'tip';
	} else if (path === 'motions') {
		path = 'motion';
	}

	const postType = getProposalTypeFromSinglePostLink(path);
	switch (postType) {
		case 'child_bounties':
			statusOptions = childBountyStatusOptions;
			break;
		case 'bounties':
			statusOptions = bountyStatusOptions;
			break;
		case 'tips':
			statusOptions = tipStatusOptions;
			break;
		case 'council_motions':
			statusOptions = motionStatusOptions;
			break;
		default:
			statusOptions = isOpenGovSupported(network) ? gov2ReferendumStatusOptions : referendumStatusOptions;
			break;
	}

	const sortByOptions: ItemType[] = [clearFilterOption, ...statusOptions];

	const handleSortByClick = ({ key }: { key: string }) => {
		if (key === 'clear_filter') {
			router.push({ pathname: '' });
			setSelectedStatus(null);
			setStatusItem(null);
		} else {
			router.push({
				pathname: '',
				query: {
					...router.query,
					proposalStatus: encodeURIComponent(JSON.stringify(key))
				}
			});
			setStatusItem(key);
			setSelectedStatus(key);
		}
	};

	return (
		<Dropdown
			theme={theme}
			menu={{
				items: sortByOptions,
				onClick: handleSortByClick,
				selectable: true
			}}
			trigger={['click']}
			overlayClassName={`${className} z-[1056]`}
			className={`${className}`}
		>
			<div className='dropdown-div flex cursor-pointer items-center whitespace-pre rounded px-2 py-1 text-xs font-normal text-bodyBlue opacity-70 hover:text-pink_primary dark:text-[#96A4B6] dark:opacity-100'>
				<span className={`${selectedStatus ? 'text-pink_primary' : ''} sm:mr-1 sm:mt-0.5`}>Status</span>
				{selectedStatus ? <DropdownPinkIcon /> : <DropdownGreyIcon />}
			</div>
		</Dropdown>
	);
};

export default styled(FilterByStatus)`
	.ant-dropdown {
		width: 200px !important;
	}
`;
