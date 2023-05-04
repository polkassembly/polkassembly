// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Divider, Dropdown, MenuProps, Modal } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import CloseIcon from '~assets/icons/close.svg';
import { ICommentHistory } from '~src/types';
import styled from 'styled-components';
import NameLabel from './NameLabel';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import { AgainstIcon, ForIcon, NeutralIcon, SlightlyAgainstIcon, SlightlyForIcon } from './CustomIcons';
import { poppins } from 'pages/_app';

interface Props{
  className?: string;
  open: boolean;
  setOpen: (pre: boolean) => void;
  history: ICommentHistory[];
  defaultAddress?: string | null;
  username?: string;
}

const CommentHistoryModal = ({ className, open, setOpen, history, defaultAddress, username }: Props) => {

	return <Modal
		open={open}
		onCancel={() => setOpen(false)}
		centered
		wrapClassName={className}
		className='closeIcon'
		footer={false}
		closeIcon={<CloseIcon/>}
		title={<label className='-mt-2 px-3 text-[#334D6E] text-[20px] font-semibold '>Comment Edit History</label>}
	>
		<div className='flex flex-col gap-[45px] mt-9 px-4'>
			{history?.map((item, index) =>
			{ const items : MenuProps['items']=[
				item?.sentiment === 1 ? { key:1,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Completely Against</div> }:null,
				item?.sentiment === 2 ? { key:2,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Slightly Against</div> }:null,
				item?.sentiment === 3 ? { key:3,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Neutral</div> }:null,
				item?.sentiment === 4 ? { key:4,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Slightly For</div> }:null,
				item?.sentiment === 5 ? { key:5,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Completely For</div> }:null
			];

			return (<div key={index} className='py-[10px] px-3 bg-[#FAFAFC] rounded-[4px]'>
				<div className='flex justify-between w-[100%] items-center'>

					<div className='flex items-center'>
						<NameLabel
							defaultAddress={defaultAddress}
							username={username}
						/>
						<div className='flex items-center'>
				&nbsp;
							<Divider className='ml-1' type="vertical" style={{ borderLeft: '1px solid #90A0B7' }} />

							<div className='flex items-center'>
								<ClockCircleOutlined className='mr-1 text-navBlue' />
								<span className='text-navBlue'>{getRelativeCreatedAt(item?.created_at)}</span>
							</div>
						</div>
					</div>
					{item?.sentiment === 1 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-lg text-white  flex justify-center items-center  min-[320px]:mr-2'><AgainstIcon className='min-[320px]:items-start' /></Dropdown>}
					{item?.sentiment === 2 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-lg text-white  flex justify-center items-center min-[320px]:mr-2'><SlightlyAgainstIcon  className='min-[320px]:items-start'/></Dropdown>}
					{item?.sentiment === 3 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-lg text-white  flex justify-center items-center min-[320px]:mr-2'><NeutralIcon  className='min-[320px]:items-start' /></Dropdown>}
					{item?.sentiment === 4 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-lg text-white  flex justify-center items-center min-[320px]:mr-2' ><SlightlyForIcon  className='min-[320px]:items-start'/></Dropdown>}
					{item?.sentiment === 5 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-[20px] mr-[-1px] mb-[-1px] mt-[-2px] text-white  flex justify-center items-center min-[320px]:mr-2'><ForIcon  className='min-[320px]:items-start'/></Dropdown>}

				</div>
				<div className='mt-2 text-[#90A0B7] text-sm px-[2px]'>
					{item?.content}
				</div>
			</div>);})
			}
		</div>
	</Modal>;

};
export default styled(CommentHistoryModal)`
.closeIcon .ant-modal-close-x{
  margin-top:4px;
}

`;