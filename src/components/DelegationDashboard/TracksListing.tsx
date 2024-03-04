// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Radio } from 'antd';
import Table from '~src/basic-components/Tables/Table';

import styled from 'styled-components';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { useApiContext } from '~src/context';
import { GetColumns } from './Coloumn';
import { DelegateDelegationIcon } from '~src/ui-components/CustomIcons';
import { useRouter } from 'next/router';
import { ETrackDelegationStatus } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ITrackDelegation } from 'pages/api/v1/delegations';
import { IDelegation } from '~src/types';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import DelegatedProfileIcon from '~assets/icons/delegate-profile.svg';
import ImageIcon from '~src/ui-components/ImageIcon';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useTheme } from 'next-themes';
import getEncodedAddress from '~src/util/getEncodedAddress';

interface Props {
	className?: string;
	address: string;
	theme?: string;
}

export interface ITrackDataType {
	index: number;
	track: string;
	description: string;
	active_proposals: number;
	status?: ETrackDelegationStatus[];
	delegated_to?: any[];
	delegated_by?: any[];
	trackNo: number;
}

const DashboardTrackListing = ({ className }: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { delegationDashboardAddress } = useUserDetailsSelector();
	const { resolvedTheme: theme } = useTheme();

	const [status, setStatusValue] = useState<ETrackDelegationStatus>(ETrackDelegationStatus.ALL);
	const [statusCounts, setStatusCounts] = useState<{ all: number; delegated: number; received_delegation: number; undelegated: number }>({
		all: 0,
		delegated: 0,
		received_delegation: 0,
		undelegated: 0
	});
	const [showTable, setShowTable] = useState<boolean | null>(true);
	const router = useRouter();
	const [rowsData, setRowsData] = useState<ITrackDataType[]>([]);
	const [data, setData] = useState<ITrackDataType[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	const filterTrackDataByTrackNumber = (trackNo: number) => {
		if (network) {
			const data: any = Object.entries(networkTrackInfo?.[network]).find(([, value]) => {
				if (!value?.fellowshipOrigin) {
					return value?.trackId === trackNo;
				}
			});
			return data;
		}
	};

	const filterByStatus = (currentStatus: ETrackDelegationStatus) => {
		setLoading(true);

		if (currentStatus === ETrackDelegationStatus.ALL) {
			setRowsData(data);
		} else {
			const filteredData = data.filter((row) => row.status?.includes(currentStatus));
			const rows = filteredData.map((item, index) => {
				return { ...item, index: index + 1 };
			});
			setRowsData(rows);
		}
		setLoading(false);
	};

	const handleStatusCounts = (data: ITrackDataType[]) => {
		let receivedDelegationStatusCount = 0;
		let undelegatedStatusCount = 0;
		for (const item of data) {
			if (item.status?.includes(ETrackDelegationStatus.RECEIVED_DELEGATION)) {
				receivedDelegationStatusCount += 1;
			} else if (item.status?.includes(ETrackDelegationStatus.UNDELEGATED)) {
				undelegatedStatusCount += 1;
			}
		}
		setStatusCounts({
			all: data?.length || 0,
			delegated: data?.length - (receivedDelegationStatusCount + undelegatedStatusCount),
			received_delegation: receivedDelegationStatusCount,
			undelegated: undelegatedStatusCount
		});
	};

	const getData = async () => {
		if (!api || !apiReady || !delegationDashboardAddress) return;

		setLoading(true);

		const { data, error } = await nextApiClientFetch<ITrackDelegation[]>('api/v1/delegations', {
			address: delegationDashboardAddress
		});
		if (data) {
			const rows = data?.map((track: any, index: number) => {
				const trackData = filterTrackDataByTrackNumber(track?.track);

				return {
					active_proposals: track?.active_proposals_count,
					delegated_by: track?.status?.includes(ETrackDelegationStatus.RECEIVED_DELEGATION)
						? track?.delegations.filter((row: IDelegation) => getEncodedAddress(row?.to, network) === getEncodedAddress(delegationDashboardAddress, network))
						: null, //rece
					delegated_to: track?.status?.includes(ETrackDelegationStatus.DELEGATED)
						? track?.delegations.filter((row: IDelegation) => getEncodedAddress(row?.to, network) !== getEncodedAddress(delegationDashboardAddress, network))
						: null,
					description: trackData[1]?.description,
					index: index + 1,
					status: track?.status,
					track: trackData[0] === 'root' ? 'Root' : trackData[0]?.split(/(?=[A-Z])/).join(' '),
					trackNo: track?.track
				};
			});

			setData(rows);
			setRowsData(rows);
			handleStatusCounts(rows);
			if (rows.length > 0) setShowTable(true);
			setLoading(false);
		} else {
			console.log(error);
		}
	};

	useEffect(() => {
		if (delegationDashboardAddress) {
			getData();
		}
		setStatusValue(ETrackDelegationStatus.ALL);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [delegationDashboardAddress, api, apiReady]);

	return (
		<div className={className}>
			<div
				className={`flex items-center gap-2 border-l-0 border-r-0 border-t-0 px-8 py-6 text-xl font-medium text-sidebarBlue dark:text-white max-lg:gap-0 ${
					showTable && 'border-b-[1px] border-solid border-[#e7ebf0] dark:text-blue-dark-high'
				} max-lg:px-4`}
			>
				Tracks
				<Radio.Group
					buttonStyle='solid'
					defaultValue={ETrackDelegationStatus.ALL}
					onChange={(e) => {
						setStatusValue(e.target.value);
						filterByStatus(e.target.value);
						setShowTable(!!statusCounts[e.target.value as ETrackDelegationStatus]);
					}}
					value={status}
					className='ml-6 flex flex-shrink-0 max-md:flex-col'
				>
					{Object.entries(statusCounts).map(([key, value]) => (
						<Radio
							key={key}
							disabled={loading}
							className={`px-3 py-2 text-xs text-bodyBlue dark:text-blue-dark-high ${
								key === status && 'rounded-[26px] bg-[#FEF2F8] dark:bg-[#33071E]' // This will now only apply to the "ALL" status
							}`}
							value={key as ETrackDelegationStatus}
						>
							{key.charAt(0).toUpperCase() + key.split('_').join(' ').slice(1, key.length)} ({value})
						</Radio>
					))}
				</Radio.Group>
			</div>
			{showTable && !!status && !!delegationDashboardAddress && (
				<Table
					className='column'
					columns={GetColumns(status)}
					dataSource={rowsData}
					rowClassName='cursor-pointer'
					loading={loading || !delegationDashboardAddress}
					pagination={false}
					theme={theme}
					onRow={(row: ITrackDataType) => {
						return {
							onClick: () => {
								router.push(`/delegation/${row?.track?.split(' ')?.join('-')?.toLowerCase() || row.track.toLowerCase()}`);
							}
						};
					}}
				/>
			)}
			{status === ETrackDelegationStatus.DELEGATED && !statusCounts.delegated && (
				<div className='flex h-[550px] flex-col items-center rounded-b-[14px] bg-white pt-24 text-[258px] dark:bg-section-dark-overlay'>
					<div className='mt-5 text-center text-bodyBlue dark:text-white'>
						<DelegateDelegationIcon />
						<h4 className='mt-0 text-base font-medium tracking-[0.005em]'>No Delegated Tracks</h4>
						<div className='mt-1 flex items-center justify-center text-sm font-normal tracking-[0.01em] max-md:flex-col'>
							You can see a track here once it has been delegated
							<CustomButton
								className={`ml-[16px] border-none dark:bg-transparent max-md:mt-[10px] ${!api || (!apiReady && 'opacity-50')}`}
								disabled={!api || !apiReady}
								variant='default'
								onClick={() => {
									setStatusValue(ETrackDelegationStatus.UNDELEGATED);
									filterByStatus(ETrackDelegationStatus.UNDELEGATED);
									setShowTable(!!statusCounts[ETrackDelegationStatus.UNDELEGATED]);
								}}
							>
								<DelegatedProfileIcon className='mr-[7px]' />
								<span className='mt-[-1px]'>Delegate</span>
							</CustomButton>
						</div>
					</div>
				</div>
			)}
			{((status === ETrackDelegationStatus.UNDELEGATED && !statusCounts.undelegated) ||
				(status === ETrackDelegationStatus.RECEIVED_DELEGATION && !statusCounts.received_delegation)) && (
				<div className='flex h-[550px] flex-col items-center rounded-b-[14px] bg-white pt-24 text-[258px] dark:bg-section-dark-overlay'>
					<ImageIcon
						src={status === ETrackDelegationStatus.UNDELEGATED ? '/assets/icons/undelegated.svg' : '/assets/icons/received-delegation.svg'}
						alt='status icon'
						imgWrapperClassName='w-[258px] h-[258px] flex items-center justify-center'
					/>
					<div className='mt-5 text-center text-bodyBlue dark:text-white'>
						<h4 className='mt-0 text-base font-medium tracking-[0.005em]'>{status === ETrackDelegationStatus.UNDELEGATED ? 'No Undelegated Tracks' : 'No Delegation Received'}</h4>
						<div className='mt-1 flex items-center justify-center text-sm font-normal tracking-[0.01em] max-md:flex-col'>
							{status === ETrackDelegationStatus.UNDELEGATED
								? 'All tracks have been delegated. Undelegate a track to view here'
								: 'You have not received delegations for any of the tracks'}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
export default styled(DashboardTrackListing)`
	.column .ant-table-thead > tr > th {
		color: ${(props) => (props.theme === 'dark' ? '#909090' : '#485F7D')} !important;
		font-size: 14px !important;
		font-weight: ${(props) => (props.theme === 'dark' ? '500' : '600')} !important;
		line-height: 21px !important;
		white-space: nowrap !important;
		border-bottom: ${(props) => (props.theme === 'dark' ? '1px solid #4B4B4B' : '')} !important;
	}
	.column .ant-table-thead > tr > th:nth-child(1) {
		text-align: center !important;
	}
	.ant-table-cell {
		background: ${(props) => (props.theme === 'dark' ? '#0D0D0D' : '')} !important;
		border-bottom: ${(props) => (props.theme === 'dark' ? '1px solid #4B4B4B' : '')} !important;
	}
	.ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before,
	.ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before {
		background-color: transparent !important;
	}
	@media only screen and (max-width: 1024px) {
		.column .ant-table-thead > tr > th:nth-child(2) {
			text-align: center !important;
		}
	}
`;
