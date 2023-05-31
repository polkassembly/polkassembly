// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Dropdown, MenuProps, Modal, Timeline, TimelineItemProps } from 'antd';
import CloseIcon from '~assets/icons/close.svg';
import { ICommentHistory } from '~src/types';
import styled from 'styled-components';
import NameLabel from './NameLabel';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import { AgainstIcon, ForIcon, NeutralIcon, SlightlyAgainstIcon, SlightlyForIcon } from './CustomIcons';
import { poppins } from 'pages/_app';
import UserAvatar from './UserAvatar';
import { diffChars } from 'diff';

interface Props{
  className?: string;
  open: boolean;
  setOpen: (pre: boolean) => void;
  history: ICommentHistory[];
  defaultAddress?: string | null;
  username?: string;
  user_id?: number;
}
interface IHistoryData extends ICommentHistory{
  expanded?: boolean;
}

const CommentHistoryModal = ({ className, open, setOpen, history, defaultAddress, username, user_id }: Props) => {

	const [historyData, setHistoryData] = useState<IHistoryData[]>(history);

	const items: TimelineItemProps[] = historyData?.map((item, index) =>
	{ const difference = historyData[index+1] ? diffChars(historyData[index+1]?.content, item?.content) : [];

		const items : MenuProps['items']=[
			item?.sentiment === 1 ? { key:1,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Completely Against</div> }:null,
			item?.sentiment === 2 ? { key:2,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Slightly Against</div> }:null,
			item?.sentiment === 3 ? { key:3,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Neutral</div> }:null,
			item?.sentiment === 4 ? { key:4,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Slightly For</div> }:null,
			item?.sentiment === 5 ? { key:5,label:<div className={`${poppins.variable} ${poppins.className} text-[10px] leading-4 bg-pink-100 font-light pl-1 pr-1 tracking-wide`}>Completely For</div> }:null
		];

		return {
			children: (

				<div className={`py-3 pl-3 pr-1 bg-[#FAFAFC] rounded-[4px] ml-2 max-sm:w-full max-sm:ml-0 ${item?.expanded && 'active-timeline'} ${poppins.variable} ${poppins.className}`}>
					<div className='flex justify-between items-center'>

						<div className='flex items-center'>
							<NameLabel
								defaultAddress={defaultAddress}
								username={username}
								textClassName='text-[#334D6E] text-xs'
							/>
							<div className='flex items-center'>
				&nbsp;
								<div className='rounded-full bg-[#A0A6AE] h-[3px] w-[3px] mr-2 flex justify-center items-center mt-[1px]'/>

								<div className='flex items-center'>
									<span className='text-navBlue text-[10px]'>{getRelativeCreatedAt(item?.created_at)}</span>
								</div>
							</div>
						</div>
						{item?.sentiment === 1 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-lg text-white  flex justify-center items-center  min-[320px]:mr-2'><AgainstIcon className='min-[320px]:items-start' /></Dropdown>}
						{item?.sentiment === 2 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-lg text-white  flex justify-center items-center min-[320px]:mr-2'><SlightlyAgainstIcon  className='min-[320px]:items-start'/></Dropdown>}
						{item?.sentiment === 3 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-lg text-white  flex justify-center items-center min-[320px]:mr-2'><NeutralIcon  className='min-[320px]:items-start' /></Dropdown>}
						{item?.sentiment === 4 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-lg text-white  flex justify-center items-center min-[320px]:mr-2' ><SlightlyForIcon  className='min-[320px]:items-start'/></Dropdown>}
						{item?.sentiment === 5 && <Dropdown overlayClassName='sentiment-hover' placement="topCenter" menu={{ items }} className='text-[20px] mr-[-1px] mb-[-1px] mt-[-2px] text-white  flex justify-center items-center min-[320px]:mr-2'><ForIcon  className='min-[320px]:items-start'/></Dropdown>}
					</div>
					<div className={`mt-2 text-[#243A57] text-sm px-[2px] font-normal ${!item?.expanded && item?.content.length > 100 && 'truncate-content'} tracking-[0.01em] ${poppins.className} ${poppins.variable} leading-6 pr-2`}>
						{historyData[index+1] ? <div>{difference?.map((text, idx) => <span key={idx} className={`${text?.removed && 'bg-[#fff3b3]'} ${text?.added && 'bg-[#fff3b3]' }`}>{text.value}</span>)}</div> : item?.content}</div>
					{item?.content.length > 100 && <span onClick={() => handleExpand(index, !item?.expanded)} className='text-xs cursor-pointer text-[#E5007A] font-medium mt-1'>{ item?.expanded ? 'Show less' : 'Show more'}</span>}
				</div>),
			dot: username && <UserAvatar
				className='flex-none hidden sm:inline-block -mt-1 -mb-1'
				username={username}
				size='large'
				id={user_id || 0}/>,
			key: index };});

	const handleExpand = (index: number, expanded: boolean) => {
		const data = historyData?.map((item, idx) => {
			if(idx === index){
				return { ...item, expanded: expanded };
			}
			return item;
		});
		setHistoryData(data);
	};

	useEffect(() => {
		setHistoryData(history);
	}, [history, open]);

	return <Modal
		open={open}
		onCancel={() => setOpen(false)}
		wrapClassName={className}
		className={`closeIcon ${poppins.variable} ${poppins.className} w-[600px] shadow-[0px 8px 18px rgba(0, 0, 0, 0.06)] max-sm:w-full`}
		footer={false}
		closeIcon={<CloseIcon/>}
		title={<label className='-mt-2 pr-3 text-[#334D6E] text-[20px] font-semibold '>Comment Edit History</label>}
	>
		<div className='flex flex-col px-4 mt-9 -mb-5 post-history-timeline'>

			<Timeline items={items}/>
		</div>
	</Modal>;

};
export default styled(CommentHistoryModal)`
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
.post-history-timeline .ant-timeline-item{
  padding-bottom: 30px !important;
}
.post-history-timeline .ant-timeline-item-content{
    inset-block-start: -13px !important;
  }

.post-history-timeline .ant-timeline .ant-timeline-item-tail{
border-inline-start: 2px solid rgba(5, 5, 5, 0) !important;
  background-image: linear-gradient(rgba(144,160,183) 33%, rgba(255,255,255) 0%) !important;
  background-position: right !important;
  background-size: 1.5px 7px !important;
  background-repeat: repeat-y !important ;
  
}

.post-history-timeline .ant-timeline .ant-timeline-item:has(.active-timeline){
  .ant-timeline-item-tail{
  background-image: linear-gradient( rgba(229,0,122) 33%, rgba(255,255,255) 0%) !important;
  background-position: right !important;
  background-size: 1.5px 7px !important;
  background-repeat: repeat-y !important ;
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

`;