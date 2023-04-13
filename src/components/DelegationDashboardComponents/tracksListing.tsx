// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Radio, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';
interface Props{
  className?: string;
}

interface IDataType{
  index: number;
  track: string;
  description: string;
  active_proposals: number;
  status: string;
}
const Status= {
	Delegated: 'delegated',
	Received_delegation: 'received_delegation',
	Undelegated: 'undelegated'
};
const DashboardTrackListing = ({ className }: Props) => {

	const [inputValue, setInputvalue ] = useState<string>('');

	const Columns: ColumnsType = [
		{ dataIndex: 'index', key: 1, render: (index) => { return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-center font-normal' >{index}</h2>;}, title: '#',width: '10%' },
		{ dataIndex: 'track', key: 2, render: (index) => { return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-start font-normal'>{index}</h2>;}, title: 'Tracks',width: '15%' },
		{ dataIndex: 'description', key: 3, render: (index) => { return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-start font-normal'>{index}</h2>;}, title: 'Description',width: '45%' },
		{ dataIndex: 'active_proposals', key: 4, render: (index) => { return <h2 className='text-[14px] text-[#243A57] tracking-wide flex items-center justify-center font-normal'>{index}</h2>;}, title: 'Active proposals',width: '10%' },
		{ dataIndex: 'status', key: 5, render: (status) => 
    { return <div className='text-[#243A57] tracking-wider flex items-center justify-start font-medium'>
      <h2 className={`text-[12px] ${status === Status.Received_delegation && 'bg-[#E7DCFF]'} ${status === Status.Delegated && 'bg-[#FFFBD8]'} ${status === Status.Undelegated && 'bg-[#FFDAD8]'} rounded-[26px] py-[6px] px-[12px]`}>{status.split('_').join(' ').toUpperCase() } </h2>
      </div >;
      }, title: 'Status',width: '20%' }];

	const Rows: IDataType[]= [ { active_proposals: 1, description: 'dasdas', index: 1, status: Status.Delegated, track: 'Root' },
		{ active_proposals: 1, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc luctus bibendum dapibun un prtesd s...', index: 2, status: Status.Delegated, track: 'Whitelisted Caller' },
		{ active_proposals: 1, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc luctus bibendum dapibun un prtesd s...', index: 3, status: Status.Delegated, track: 'Staking Admin' },
		{ active_proposals: 1, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc luctus bibendum dapibun un prtesd s...', index: 4, status: Status.Received_delegation, track: 'Treasurer' },
		{ active_proposals: 1, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc luctus bibendum dapibun un prtesd s...', index: 5, status: Status.Undelegated, track: 'Lease Admin' },
		{ active_proposals: 1, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc luctus bibendum dapibun un prtesd s...', index: 6, status: Status.Received_delegation, track: 'Fellowship Admin' },
		{ active_proposals: 1, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc luctus bibendum dapibun un prtesd s...', index: 7, status: Status.Delegated, track: 'General Admin' }];

	return <div className={className} >
		<div className='flex font-medium items-center text-sidebarBlue text-xl gap-6 px-8 py-6'>
      Tracks
			<Radio.Group buttonStyle='solid' defaultValue={'all'} onChange={(e) => setInputvalue(e.target.value)} value={inputValue} className='flex gap-4 max-md:flex-col'>
				<Radio className='text-[#243A57B2] text-xs ' value={'all'}>All (5)</Radio>
				<Radio className='text-[#243A57B2] text-xs' value={'delegated'}>Delegated (2)</Radio>
				<Radio className='text-[#243A57B2] text-xs' value={Status.Undelegated}>Undelegated (9)</Radio>
				<Radio className='text-[#243A57B2] text-xs' value={Status.Received}>Received delegation (3)</Radio>
			</Radio.Group>
		</div>
		<Table
			className='column'
			columns= {Columns}
			dataSource= { Rows }
		>
		</Table>
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