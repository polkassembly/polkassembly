// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Radio, Table } from 'antd';

import styled from 'styled-components';

import { networkTrackInfo } from '~src/global/post_trackInfo';
import { useApiContext, useNetworkContext } from '~src/context';
import  { GetColumns } from './Coloumn';
import DelegatedProfileIcon from '~assets/icons/delegate-profile.svg';

import { DelegatedIcon, UnDelegatedIcon, ReceivedDelegationIcon } from '~src/ui-components/CustomIcons';
import { useRouter } from 'next/router';
import { ETrackDelegationStatus } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ITrackDelegation } from 'pages/api/v1/delegations';

interface Props{
  className?: string;
  address: string;
}

export interface ITrackDataType{
  index: number;
  track: string;
  description: string;
  active_proposals: number;
  status?: string;
  delegated_to?: any[];
  delegated_by?: any[];
  trackNo: number;
}

const DashboardTrackListing = ({ className, address }: Props) => {

	const [status, setStatusvalue ] = useState<ETrackDelegationStatus>(ETrackDelegationStatus.All);
	const  { network } = useNetworkContext();
	const [delegatedCount, setDelegatedCount] = useState<number>(0);
	const [undelegatedCount, setUndelegatedCount] = useState<number>(0);
	const [receivedDelegationCount, setReceivedDelegationCount] = useState<number>(0);
	const [allCount, setAllCount] = useState<number>(0);
	const [showTable, setShowTable] = useState<boolean>(false);
	const router = useRouter();
	const [rowsData, setRowsData] = useState<ITrackDataType[]>([]);
	const { api, apiReady } = useApiContext();
	const [data, setData] = useState<ITrackDataType[]>([]);
	const [loading , setLoading] = useState<boolean>(false);

	const filterTrackDataByTrackNumber = (trackNo: number) => {
		if(network){
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const data:any = Object.entries(networkTrackInfo?.[network]).find(([key, value]) => {
				if (!value?.fellowshipOrigin) {
					return  value?.trackId === trackNo;
				}

			});
			return data;
		}

	};

	const filterByStatus = (currentStatus: ETrackDelegationStatus) => {

		if(currentStatus === ETrackDelegationStatus.All){
			setRowsData(data);
		}
		if(currentStatus === ETrackDelegationStatus.Received_Delegation){
			const filteredData = data.filter((row) => row.status === ETrackDelegationStatus.Received_Delegation);
			const rows = filteredData.map((item, index) => {return { ...item, index: index+1 };} );
			setRowsData(rows);
		}
		if(currentStatus === ETrackDelegationStatus.Undelegated){
			const filteredData = data.filter((row) => row.status === ETrackDelegationStatus.Undelegated);
			const rows = filteredData.map((item, index) => {return { ...item, index: index+1 };} );
			setRowsData(rows);
		}
		if(currentStatus === ETrackDelegationStatus.Delegated){
			const filteredData = data.filter((row) => row.status === ETrackDelegationStatus.Delegated);
			const rows = filteredData.map((item, index) => {return { ...item, index: index+1 };} );
			setRowsData(rows);
		}

	};

	const getData = async() => {
		if (!api || !apiReady ) return;

		setLoading(true);

		const { data, error } = await nextApiClientFetch<ITrackDelegation[]>(`api/v1/delegations?address=${address}`);

		if(data){
			const rows = data?.map((track: any, index: number) => {

				const trackData = filterTrackDataByTrackNumber(track?.track);

				if(track.status === ETrackDelegationStatus.Delegated){
					setDelegatedCount(delegatedCount + 1);
				}
				else if(track.status === ETrackDelegationStatus.Undelegated){
					setUndelegatedCount(undelegatedCount + 1);
				}
				else if(track.status === ETrackDelegationStatus.Received_Delegation){
					setReceivedDelegationCount(receivedDelegationCount + 1);
				}

				return {
					active_proposals: track?.active_proposals_count,
					delegated_by: track?.delegations,
					delegated_to: track?.delegations,
					description: trackData[1]?.description,
					index: index+1,
					status: track.status === ETrackDelegationStatus.Delegated && ETrackDelegationStatus.Delegated
        ||  track?.status === ETrackDelegationStatus.Undelegated && ETrackDelegationStatus.Undelegated
        ||  track?.status === ETrackDelegationStatus.Received_Delegation && ETrackDelegationStatus.Received_Delegation || ETrackDelegationStatus.All ,
					track: trackData[0] === 'root' ? 'Root': trackData[0]?.split(/(?=[A-Z])/).join(' '),
					trackNo: track?.track
				};
			});

			setData(rows);
			setRowsData(rows);
			setAllCount(rows?.length);
			setLoading(false);

		}else{
			console.log(error);
		}
	};

	useEffect(() => {
		data.length === 0 && getData();
		if(data.length > 0){
			const receivedDelegations = data.filter((row) => row.status === ETrackDelegationStatus.Received_Delegation);
			setReceivedDelegationCount(receivedDelegations?.length);
			const delegateDelegations = data.filter((row) => row.status === ETrackDelegationStatus.Delegated);
			setDelegatedCount(delegateDelegations?.length);
			const undelegateDelegations = data.filter((row) => row.status === ETrackDelegationStatus.Undelegated);
			setUndelegatedCount(undelegateDelegations?.length);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data]);

	const handleShowTable = (status:ETrackDelegationStatus) => {

		if(status === ETrackDelegationStatus.All){
			setShowTable(true);
		}
		else if(status === ETrackDelegationStatus.Delegated){
			if(delegatedCount !== 0){
				setShowTable(true);
			}else{
				setShowTable(false);
			}
		}
		else if(status === ETrackDelegationStatus.Undelegated){
			if(undelegatedCount !== 0){
				setShowTable(true);
			}else{
				setShowTable(false);
			}
		}
		else if(status === ETrackDelegationStatus.Received_Delegation){
			if(receivedDelegationCount !== 0){
				setShowTable(true);
			}
			else{
				setShowTable(false);
			}
		}
	};

	useEffect(() => {
		handleShowTable(status);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status]);

	return <div className={className} >
		<div className={`flex font-medium items-center text-sidebarBlue text-xl gap-2 max-lg:gap-0 px-8 py-6 border-l-0 border-t-0 border-r-0 ${showTable && 'border-[#e7ebf0] border-b-[1px] border-solid'}`}>
      Tracks
			<Radio.Group buttonStyle='solid' defaultValue={'all'} onChange={(e) => {setStatusvalue(e.target.value); filterByStatus(e.target.value); }} value={status} className='flex max-md:flex-col ml-[24px] flex-shrink-0'>
				<Radio className={`text-[#243A57B2] text-xs py-[6px] px-[14px] ${ETrackDelegationStatus.All === status && 'bg-[#FEF2F8] rounded-[26px]'}`} value={ETrackDelegationStatus.All}>All ({allCount})</Radio>
				<Radio className={`text-[rgba(36,58,87,0.7)] text-xs py-[6px] px-[14px] ${ETrackDelegationStatus.Delegated === status && 'bg-[#FEF2F8] rounded-[26px]'}`} value={ETrackDelegationStatus.Delegated}>Delegated ({delegatedCount})</Radio>
				<Radio className={`text-[#243A57B2] text-xs py-[6px] px-[14px] ${ETrackDelegationStatus.Undelegated === status && 'bg-[#FEF2F8] rounded-[26px]'}`} value={ETrackDelegationStatus.Undelegated}>Undelegated ({undelegatedCount})</Radio>
				<Radio className={`text-[#243A57B2] text-xs py-[6px] px-[14px] ${ETrackDelegationStatus.Received_Delegation === status && 'bg-[#FEF2F8] rounded-[26px]'}`} value={ETrackDelegationStatus.Received_Delegation}>Received delegation ({receivedDelegationCount})</Radio>
			</Radio.Group>
		</div>
		{showTable  && status && <Table
			className='column'
			columns = { GetColumns( status )}
			dataSource= { rowsData }
			rowClassName='cursor-pointer'
			loading = {loading}
			pagination= {false}
			onRow={(rowData: ITrackDataType) => {
				return {
					onClick: () => router.push(`/delegation/${rowData?.track.split(' ').join('-').toLowerCase()}`)
				};
			}}
		>
		</Table>}

		{status === ETrackDelegationStatus.Delegated && delegatedCount === 0 && <div className='h-[550px] bg-white flex pt-[56px] items-center flex-col text-[258px] rounded-b-[14px]'>
			<DelegatedIcon/>
			<div className='text-[#243A57] mt-5 text-center'>
				<h4 className='text-base font-medium tracking-[0.005em] mt-0'>No Delegated Tracks</h4>
				<div className='text-sm tracking-[0.01em] font-normal mt-1 flex justify-center items-center max-md:flex-col'>
          You can see a track here once it has been delegated
					<div  onClick={() => setStatusvalue(ETrackDelegationStatus.Undelegated)} className='text-[#E5007A] font-normal tracking-wide text-sm ml-[17px] flex items-center justify-center  max-md:mt-[10px] cursor-pointer' >
						<DelegatedProfileIcon className='mr-[7px]'/>
						<span className='mt-[-1px]'>
               Delegate Track
						</span>
					</div>
				</div>
			</div>
		</div>}

		{status === ETrackDelegationStatus.Undelegated && undelegatedCount === 0 && <div className='h-[550px] pt-[56px] bg-white flex items-center text-[258px] flex-col rounded-b-[14px]'>
			<UnDelegatedIcon/>
			<div className='text-[#243A57] mt-5 text-center'>
				<h4 className='text-base font-medium tracking-[0.005em] mt-0'>No Undelegated Tracks</h4>
				<div className='text-sm tracking-[0.01em] font-normal mt-1 flex justify-center items-center max-md:flex-col'>
          All tracks have been delegated. Undelegate a track to view here
				</div>
			</div>
		</div>}

		{status === ETrackDelegationStatus.Received_Delegation && receivedDelegationCount === 0 && <div className='h-[550px] pt-[56px] bg-white flex items-center text-[258px] flex-col rounded-b-[14px]'>
			<ReceivedDelegationIcon/>
			<div className='text-[#243A57] mt-5 text-center'>
				<h4 className='text-base font-medium tracking-[0.005em] mt-0'>No Received Delegation</h4>
				<div className='text-sm tracking-[0.01em] font-normal mt-1 flex justify-center items-center max-md:flex-col'>
          You have not been delegated any track yet
				</div>
			</div>
		</div>}
	</div>;
};
export default styled(DashboardTrackListing)`
.column .ant-table-thead > tr > th{
  color:#485F7D !important;
  font-size: 14px;
  font-weight: 600px;
  line-height: 21px;
}
.column .ant-table-thead > tr > th:nth-child(1){
  text-align: center;
}

`;