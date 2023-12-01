// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { useRouter } from 'next/router';
import { Dropdown } from '~src/ui-components/Dropdown';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { bountyStatusOptions, childBountyStatusOptions, gov2ReferendumStatusOptions, motionStatusOptions, referendumStatusOptions, tipStatusOptions } from '~src/global/statuses';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { useNetworkSelector } from '~src/redux/selectors';
import DropdownGreyIcon from '~assets/icons/dropdown-grey.svg';
import { getProposalTypeFromSinglePostLink } from '~src/global/proposalType';
import { useTheme } from 'next-themes';

interface SortByDropdownProps {
	theme?: string | undefined;
	setStatusItem?: any;
}

const SortByStatusDropdownComponent: React.FC<SortByDropdownProps> = ({ setStatusItem }) => {
	const router = useRouter();
	const { resolvedTheme: theme } = useTheme();
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
		// case isOpenGovSupported()
		default:
			statusOptions = isOpenGovSupported(network) ? gov2ReferendumStatusOptions : referendumStatusOptions;
			break;
	}

	const sortByOptions: ItemType[] = statusOptions;
	const handleSortByClick = ({ key }: { key: string }) => {
		router.push({
			pathname: '',
			query: {
				...router.query,
				proposalStatus: encodeURIComponent(JSON.stringify(key))
			}
		});
		setStatusItem(key);
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
			overlayClassName='z-[1056]'
		>
			<div className='dropdown-div flex cursor-pointer items-center whitespace-pre rounded px-2 py-1 text-bodyBlue hover:text-pink_primary'>
				<span className='text-xs font-normal opacity-70 dark:text-[#96A4B6] dark:opacity-100 sm:mr-1 sm:mt-0.5'>Status</span>
				<DropdownGreyIcon />
			</div>
		</Dropdown>
	);
};

export default SortByStatusDropdownComponent;
