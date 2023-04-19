// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Radio, Table } from 'antd';

import styled from 'styled-components';

import { networkTrackInfo } from '~src/global/post_trackInfo';
import { useNetworkContext } from '~src/context';
import  { EStatus,GetColumns } from './Coloumn';
import DelegatedProfileIcon from '~assets/icons/delegate-profile.svg';

import { DelegatedIcon, UnDelegatedIcon, ReceivedDelegationIcon } from '~src/ui-components/CustomIcons';
import { useRouter } from 'next/router';

interface Props{
  className?: string;
}

export interface IDataType{
  index: number;
  track: string;
  description: string;
  active_proposals: number;
  status?: string;
  delegated_to?:string;
  delegated_by?:string;
}

const DashboardTrackListing = ({ className }: Props) => {

	const [status, setStatusvalue ] = useState<EStatus>(EStatus.All);
	const  { network } = useNetworkContext();
	const [delegatedCount, setDelegatedCount] = useState<number>(0);
	const [undelegatedCount, setUndelegatedCount] = useState<number>(0);
	const [receivedDelegationCount, setReceivedDelegationCount] = useState<number>(0);
	const [allCount, setAllCount] = useState<number>(14);
	const [showTable, setShowTable] = useState<boolean>(false);
	const router = useRouter();
	const rowData:IDataType[] = [];

	if(network ){
		Object.entries(networkTrackInfo?.[network]).map(([key, value],index) => {
			if (!value?.fellowshipOrigin) {
				rowData.push( { active_proposals: 1,
					delegated_by:'0x4b809cCF39fF19B0ef43172c3578a188Ffb6a1f3',
					delegated_to :'0x4b809cCF39fF19B0ef43172c3578a188Ffb6a1f3',
					description: value.description,
					index: index+1,
					status: EStatus.Delegated,
					track: key === 'root' ? 'Root': key?.split(/(?=[A-Z])/).join(' ') });
			}

		});
	}

	const handleShowTable = (status:EStatus) => {

		if(status === EStatus.All){
			setShowTable(true);
		}
		else if(status === EStatus.Delegated){
			if(delegatedCount !== 0){
				setShowTable(true);
			}
			setShowTable(false);
		}
		else if(status === EStatus.Undelegated){
			if(undelegatedCount !== 0){
				setShowTable(true);
			}
			setShowTable(false);
		}
		else if(status === EStatus.Received_Delegation){
			if(receivedDelegationCount !== 0){
				setShowTable(true);
			}
			setShowTable(false);
		}
	};

	useEffect(() => {
		handleShowTable(status);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status]);

	return <div className={className} >
		<div className={`flex font-medium items-center text-sidebarBlue text-xl gap-2 max-lg:gap-0 px-8 py-6 border-l-0 border-t-0 border-r-0 ${showTable && 'border-[#e7ebf0] border-b-[1px] border-solid'}`}>
      Tracks
			<Radio.Group buttonStyle='solid' defaultValue={'all'} onChange={(e) => setStatusvalue(e.target.value)} value={status} className='flex max-md:flex-col ml-[24px] flex-shrink-0'>
				<Radio className={`text-[#243A57B2] text-xs py-[6px] px-[14px] ${EStatus.All === status && 'bg-[#FEF2F8] rounded-[26px]'}`} value={EStatus.All}>All ({allCount})</Radio>
				<Radio className={`text-[rgba(36,58,87,0.7)] text-xs py-[6px] px-[14px] ${EStatus.Delegated === status && 'bg-[#FEF2F8] rounded-[26px]'}`} value={EStatus.Delegated}>Delegated ({delegatedCount})</Radio>
				<Radio className={`text-[#243A57B2] text-xs py-[6px] px-[14px] ${EStatus.Undelegated === status && 'bg-[#FEF2F8] rounded-[26px]'}`} value={EStatus.Undelegated}>Undelegated ({undelegatedCount})</Radio>
				<Radio className={`text-[#243A57B2] text-xs py-[6px] px-[14px] ${EStatus.Received_Delegation === status && 'bg-[#FEF2F8] rounded-[26px]'}`} value={EStatus.Received_Delegation}>Received delegation ({receivedDelegationCount})</Radio>
			</Radio.Group>
		</div>
		{showTable && <Table
			className='column'
			columns= {GetColumns( status )}
			dataSource= { rowData }
			rowClassName='cursor-pointer'
			pagination= {false}
			onRow={(rowData: IDataType) => {
				return {
					onClick: () => router.push(`/delegation-dashboard/${rowData?.track.split(' ').join('-').toLowerCase()}`)
				};
			}}
		>
		</Table>}

		{status === EStatus.Delegated && delegatedCount === 0 && <div className='h-[550px] bg-white flex pt-[56px] items-center flex-col text-[258px] rounded-b-[14px]'>
			<DelegatedIcon/>
			<div className='text-[#243A57] mt-5 text-center'>
				<h4 className='text-base font-medium tracking-[0.005em] mt-0'>No Delegated Tracks</h4>
				<div className='text-sm tracking-[0.01em] font-normal mt-1 flex justify-center items-center max-md:flex-col'>
          You can see a track here once it has been delegated
					<div  onClick={() => setStatusvalue(EStatus.Undelegated)} className='text-[#E5007A] font-normal tracking-wide text-sm ml-[17px] flex items-center justify-center  max-md:mt-[10px] cursor-pointer' >
						<DelegatedProfileIcon className='mr-[7px]'/>
						<span className='mt-[-1px]'>
               Delegate Track
						</span>
					</div>
				</div>
			</div>
		</div>}

		{status === EStatus.Undelegated && undelegatedCount === 0 && <div className='h-[550px] pt-[56px] bg-white flex items-center text-[258px] flex-col rounded-b-[14px]'>
			<UnDelegatedIcon/>
			<div className='text-[#243A57] mt-5 text-center'>
				<h4 className='text-base font-medium tracking-[0.005em] mt-0'>No Undelegated Tracks</h4>
				<div className='text-sm tracking-[0.01em] font-normal mt-1 flex justify-center items-center max-md:flex-col'>
          All tracks have been delegated. Undelegate a track to view here
				</div>
			</div>
		</div>}

		{status === EStatus.Received_Delegation && receivedDelegationCount === 0 && <div className='h-[550px] pt-[56px] bg-white flex items-center text-[258px] flex-col rounded-b-[14px]'>
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
.column .ant-table-thead > tr > th:nth-child(4){
  text-align: center;
}
`;