// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { bountyStatusOptions, childBountyStatusOptions, gov2ReferendumStatusOptions, motionStatusOptions, referendumStatusOptions, tipStatusOptions } from '~src/global/statuses';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { useNetworkSelector } from '~src/redux/selectors';
import DropdownGreyIcon from '~assets/icons/dropdown-grey.svg';
import DropdownPinkIcon from '~assets/icons/dropdown-pink.svg';
import { getProposalTypeFromSinglePostLink } from '~src/global/proposalType';
import { useTheme } from 'next-themes';
import { Checkbox, Divider, Popover } from 'antd';
import styled from 'styled-components';
import { poppins } from 'pages/_app';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';

interface SortByDropdownProps {
	theme?: string | undefined;
	setStatusItem?: any;
}

const FilterByStatus: React.FC<SortByDropdownProps> = ({ setStatusItem }) => {
	const router = useRouter();
	const { resolvedTheme: theme } = useTheme();
	const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
	const [checkedItems, setCheckedItems] = useState<CheckboxValueType[]>([]);
	const { network } = useNetworkSelector();
	let path = router.pathname.split('/')[1];
	let statusOptions = isOpenGovSupported(network) ? gov2ReferendumStatusOptions : referendumStatusOptions;

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

	const sortByOptions: ItemType[] = [...statusOptions];

	const handleSortByClick = (key: any) => {
		if (key === 'clear_filter') {
			setCheckedItems([]);
			router.push({ pathname: '' });
			setSelectedStatus(null);
			setStatusItem?.([]);
		} else {
			router.replace({
				pathname: '',
				query: {
					...router.query,
					proposalStatus: encodeURIComponent(JSON.stringify(key))
				}
			});
			setStatusItem?.(key);
			setSelectedStatus(key);
		}
	};

	const onChange = (list: CheckboxValueType[]) => {
		setCheckedItems(list);
		handleSortByClick(list);
	};

	const content = (
		<div className='px-2'>
			<div
				className='flex cursor-pointer justify-end p-1 text-xs text-pink_primary'
				onClick={() => handleSortByClick('clear_filter')}
			>
				Clear Filter
			</div>

			<Divider
				className='my-2 mb-4'
				style={{ background: '#D2D8E0' }}
			/>
			<Checkbox.Group
				value={checkedItems}
				onChange={onChange}
				style={{ boxShadow: '0px 2px 14px 0px rgba(0, 0, 0, 0.06)' }}
				className={`mt-1.5 flex max-h-[200px] flex-col justify-start overflow-y-scroll tracking-[0.01em]  ${poppins.className} ${poppins.variable}`}
			>
				{sortByOptions.map((item, index) => (
					<div key={index}>
						<Checkbox value={item?.key}>
							<div className='text-xs tracking-wide text-[#667589] dark:text-white'>{(item as any)?.label}</div>
						</Checkbox>
					</div>
				))}
			</Checkbox.Group>
		</div>
	);

	return (
		<Popover
			zIndex={1056}
			content={content}
			placement='bottom'
			overlayClassName={`w-[250px] dark:bg-section-dark-overlay dark:rounded-lg dark:text-white ${theme == 'dark' ? '[&>ul]:bg-section-dark-background [&>ul>li]:text-white' : ''}`}
		>
			<div className='dropdown-div flex cursor-pointer items-center whitespace-pre rounded px-2 py-1 text-xs font-normal text-bodyBlue opacity-70 dark:text-[#96A4B6] dark:opacity-100'>
				<span className={`${selectedStatus ? 'text-pink_primary' : ''} sm:mr-1 sm:mt-0.5`}>Status</span>
				{selectedStatus ? <DropdownPinkIcon /> : <DropdownGreyIcon />}
			</div>
		</Popover>
	);
};

export default styled(FilterByStatus)`
	.ant-dropdown {
		width: 200px !important;
	}
`;
