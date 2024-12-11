// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import {
	bountyStatusOptions,
	childBountyStatusOptions,
	gov2ReferendumStatusClosedOptions,
	gov2ReferendumStatusOptions,
	gov2ReferendumStatusSubmittedOptions,
	gov2ReferendumStatusVotingOptions,
	motionStatusOptions,
	proposalStatusOptions,
	referendumStatusOptions,
	techCommiteeStatusOptions,
	tipStatusOptions,
	treasuryProposalStatusOptions
} from '~src/global/statuses';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { useNetworkSelector } from '~src/redux/selectors';
import DropdownGreyIcon from '~assets/icons/dropdown-grey.svg';
import { getProposalTypeFromSinglePostLink } from '~src/global/proposalType';
import { useTheme } from 'next-themes';
import { Checkbox, Divider } from 'antd';
import styled from 'styled-components';
import { dmSans } from 'pages/_app';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
import Popover from '~src/basic-components/Popover';
import { useTranslation } from 'next-i18next';

interface SortByDropdownProps {
	theme?: string | undefined;
	setStatusItem?: any;
}

const FilterByStatus: React.FC<SortByDropdownProps> = ({ setStatusItem }) => {
	const router = useRouter();
	const trackStatus = router?.query?.trackStatus;
	const { resolvedTheme: theme } = useTheme();
	const { t } = useTranslation('common');
	const [checkedItems, setCheckedItems] = useState<CheckboxValueType[]>([]);
	useEffect(() => {
		setCheckedItems([]);
		setStatusItem?.([]);
	}, [trackStatus, setStatusItem]);

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
	} else if (path === 'proposals') {
		path = 'proposal';
	} else if (path === 'referenda') {
		path = 'referendum';
	} else if (path === 'treasury-proposals') {
		path = 'treasury';
	} else if (path === 'tech-comm-proposals') {
		path = 'tech';
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
		case 'democracy_proposals':
			statusOptions = proposalStatusOptions;
			break;
		case 'referendums':
			statusOptions = referendumStatusOptions;
			break;
		case 'treasury_proposals':
			statusOptions = treasuryProposalStatusOptions;
			break;
		case 'tech_committee_proposals':
			statusOptions = techCommiteeStatusOptions;
			break;
		default:
			if (isOpenGovSupported(network)) {
				if (trackStatus === 'all') {
					statusOptions = gov2ReferendumStatusOptions;
				} else if (trackStatus === 'submitted') {
					statusOptions = gov2ReferendumStatusSubmittedOptions;
				} else if (trackStatus === 'voting') {
					statusOptions = gov2ReferendumStatusVotingOptions;
				} else {
					statusOptions = gov2ReferendumStatusClosedOptions;
				}
			} else {
				statusOptions = referendumStatusOptions;
			}
			break;
	}

	const sortByOptions: ItemType[] = [...statusOptions];
	const handleSortByClick = (key: any) => {
		if (key === 'clear_filter') {
			const newQuery = { ...router.query };
			delete newQuery.proposalStatus;
			router.replace({
				pathname: '',
				query: newQuery
			});
			setCheckedItems([]);
			setStatusItem?.([]);
		} else if (key.length > 0) {
			if (statusOptions === gov2ReferendumStatusOptions || statusOptions == gov2ReferendumStatusVotingOptions) {
				if (key.includes('Deciding')) {
					key.push('DecisionDepositPlaced');
				} else {
					key = key.filter((item: string) => item !== 'DecisionDepositPlaced');
				}
			}
			router.replace({
				pathname: '',
				query: {
					...router.query,
					proposalStatus: encodeURIComponent(JSON.stringify(key))
				}
			});
			setStatusItem?.(key);
		} else {
			const newQuery = { ...router.query };
			delete newQuery.proposalStatus;
			router.replace({
				pathname: '',
				query: newQuery
			});
			setStatusItem?.([]);
		}
	};

	const onChange = (list: CheckboxValueType[]) => {
		setCheckedItems(list);
		handleSortByClick(list);
	};

	const content = (
		<div className={`${dmSans.className} ${dmSans.variable} px-2`}>
			<div
				className='-mr-2 flex cursor-pointer justify-end p-1 text-[10px] text-pink_primary'
				onClick={() => handleSortByClick('clear_filter')}
			>
				{t('clear_filter')}
			</div>

			<Divider
				className='-ml-5 mb-3 mt-0 w-[250px] dark:bg-separatorDark'
				style={{ background: '#D2D8E0' }}
			/>
			<Checkbox.Group
				value={checkedItems}
				onChange={onChange}
				className={`mt-1.5 flex max-h-[200px] flex-col justify-start overflow-y-scroll px-2 py-2 tracking-[0.01em]  ${dmSans.className} ${dmSans.variable}`}
			>
				{sortByOptions.map((item, index) => (
					<div key={index}>
						<Checkbox value={item?.key}>
							<div className='mb-3 text-xs tracking-wide text-[#667589] dark:text-white'>{(item as any)?.label}</div>
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
			<div className='dropdown-div flex cursor-pointer items-center whitespace-pre rounded px-2 py-1 text-sm font-normal text-lightBlue dark:text-blue-dark-medium'>
				<span className='sm:mr-1 sm:mt-0.5'>{t('status')}</span>
				<DropdownGreyIcon />
			</div>
		</Popover>
	);
};

export default styled(FilterByStatus)`
	.ant-dropdown {
		width: 200px !important;
	}
`;
