// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Divider, Modal, Timeline, TimelineItemProps } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import CloseIcon from '~assets/icons/close.svg';
import { IPostHistory } from '~src/types';
import styled from 'styled-components';
import NameLabel from './NameLabel';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import { poppins } from 'pages/_app';
import UserAvatar from './UserAvatar';
import dayjs from 'dayjs';

interface Props{
  className?: string;
  open: boolean;
  setOpen: (pre: boolean) => void;
  history: IPostHistory[];
  defaultAddress?: string | null;
  username: string;
  user_id: number | null | undefined;
}
interface IHistoryData extends IPostHistory{
  expandContent?: boolean;
  expand?:boolean;
}
enum EExpandType {
  Expand = 'expand',
  ExpandContent = 'expandContent'
}

const PostHistoryModal = ({ className, open, setOpen, history, defaultAddress, username, user_id }: Props) => {

	const [historyData, setHistoryData] = useState<IHistoryData[]>([]);
	const items: TimelineItemProps[] = historyData?.map((item, index) =>
	{
		const date = new Date(item?.created_at);

		return {
			children: !item?.expand ? <div className='text-[#334D6E] h-[60px] ml-6 text-sm tracking-[0.01em] flex flex-col gap-2 font-medium max-sm:w-full max-sm:ml-0'>
          Edited on {dayjs(date).format('DD MMM YY')}
				<div className='text-pink_primary text-[14px] leading-[11px] text-xs flex justify-start cursor-pointer' onClick={() => handleExpand(index, EExpandType.Expand)}>
					<span className='border-0 border-solid border-b-[1px]'>See Details</span></div>
			</div>
				: <div className={`py-4 px-6 bg-[#FAFAFC] rounded-[4px] w-[95%] shadow ml-6 max-sm:w-full max-sm:ml-0 ${item?.expand && 'active-timeline'}`}>
					<div className='flex items-center max-sm:flex-col max-sm:justify-start max-sm:gap-2  max-sm:items-start'>
						<div className='flex items-center max-sm:justify-start'>
							<span className='mr-1 text-xs text-[#90A0B7]'>By:</span>
							<NameLabel
								defaultAddress={defaultAddress}
								username={username}
							/>
						</div>
						<div className='flex items-center'>
							<Divider className='ml-1 flex-none hidden sm:inline-block' type="vertical" style={{ borderLeft: '1px solid #90A0B7' }} />
							<div className='flex items-center'>
								<ClockCircleOutlined className='mr-2 ml-1 text-navBlue' />
								<span className='text-navBlue text-xs'>{getRelativeCreatedAt(date)}</span>
							</div>
						</div>
					</div>
					<div className='text-[#334D6E] text-[18px] mt-[11px] font-medium'>{item?.title}</div>
					<div className={`mt-2 text-[#90A0B7] text-sm px-[2px] font-normal tracking-[0.01em] ${!item?.expandContent && item?.content.length > 100 && 'truncate-content'}  ${poppins.className} ${poppins.variable} leading-6 pr-2`}>
						{item?.content}
					</div>
					{item?.content.length > 100 && <span onClick={() => handleExpand(index, EExpandType.ExpandContent)} className='text-xs cursor-pointer text-[#E5007A] font-medium mt-1'>{ item?.expandContent ? 'Show less' : 'Show more'}</span>}
				</div>,
			dot: username && user_id && <UserAvatar
				className='flex-none hidden sm:inline-block -mb-1 -mt-1'
				username={username}
				size='large'
				id={user_id}/>
			,
			key: index };});

	const handleExpand = (index: number, expandType: EExpandType) => {
		const data = historyData.map((item, idx) => {
			if(idx === index ){
				if(expandType === EExpandType.Expand){
					if(item?.expand ){
						return { ...item, expand: !item?.expand, expandContent: false };
					}
					return { ...item, expand: !item?.expand };
				}
				else if(expandType === EExpandType.ExpandContent){
					return { ...item, expandContent: !item?.expandContent };
				}
			}

			return item;
		});
		setHistoryData(data);
	};

	useEffect(() => {
		setHistoryData(history.map((item, index) => {return index === 0 ? { ...item , expand: true } : item; }));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	useEffect(() => {
		if(!historyData || !historyData.length) return;

		Array.from(document.querySelectorAll('.post-history-timeline .ant-timeline-item-tail'))?.map((element, index) => element.addEventListener('click', () => handleExpand(index, EExpandType.Expand)) );

		return () => { Array.from(document.querySelectorAll('.post-history-timeline .ant-timeline-item-tail'))?.map((element, index) => element.removeEventListener('click', () => handleExpand(index, EExpandType.Expand)) );};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [historyData]);

	return <Modal
		open={open}
		onCancel={() => setOpen(false)}
		wrapClassName={className}
		className={`closeIcon ${poppins.variable} ${poppins.className} w-[600px] shadow-[0px 8px 18px rgba(0, 0, 0, 0.06)] max-sm:w-full`}
		footer={false}
		closeIcon={<CloseIcon/>}
		title={<label className='-mt-2 px-3 text-[#334D6E] text-[20px] font-semibold '>Proposal Edit History</label>}
	>
		<div className='flex flex-col px-4 pb-9 mt-9 post-history-timeline'>
			<Timeline items={items}/>
		</div>
	</Modal>;

};
export default styled(PostHistoryModal)`
.closeIcon .ant-modal-close-x{
  margin-top:4px;
}
.truncate-content{
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; 
  width: 100%;
  overflow: hidden;
}
.post-history-timeline .ant-timeline .ant-timeline-item-tail{
  background-image: linear-gradient(rgba(144,160,183) 50%, rgba(255,255,255) 0%) !important;
  background-position: right !important;
  background-size: 1px 7px !important;
  background-repeat: repeat-y !important ;
  cursor: pointer !important;
}
.post-history-timeline .ant-timeline .ant-timeline-item:has(.active-timeline){
  .ant-timeline-item-tail{
  background-image: linear-gradient( rgba(229,0,122) 33%, rgba(255,255,255) 0%) !important;
  background-position: right !important;
  background-size: 1.5px 7px !important;
  background-repeat: repeat-y !important ;
  cursor: pointer !important;
}
}
@media screen and (max-width: 640px){
.post-history-timeline .ant-timeline .ant-timeline-item-tail{
border: none !important;
}
.post-history-timeline .ant-timeline .ant-timeline-item-content{
  margin-left: 0px !important; 
}
}
.shadow{
  box-shadow:-2px 2px 6px rgba(128, 10, 73, 0.2) !important;
  margin-top: 10px !important;
}

`;