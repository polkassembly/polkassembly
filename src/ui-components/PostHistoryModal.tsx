// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { diffChars } from 'diff';
import { Modal, Timeline, TimelineItemProps } from 'antd';
import CloseIcon from '~assets/icons/close.svg';
import { IPostHistory } from '~src/types';
import styled from 'styled-components';
import NameLabel from './NameLabel';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';
import UserAvatar from './UserAvatar';
import { noTitle } from '~src/global/noTitle';
import { poppins } from 'pages/_app';
// import sanitizeMarkdown from '~src/util/sanitizeMarkdown';
import Markdown from './Markdown';

interface Props{
  className?: string;
  open: boolean;
  setOpen: (pre: boolean) => void;
  history: IPostHistory[];
  defaultAddress?: string | null;
  username: string;
  user_id?: number | null | undefined;
}
interface IHistoryData extends IPostHistory{
  expandedContent?: boolean;
  expanded?: boolean;
}
enum EExpandType {
  Expanded = 'expanded',
  ExpandedContent = 'expandedContent'
}

const PostHistoryModal = ({ className, open, setOpen, history, defaultAddress, username, user_id }: Props) => {

	const [historyData, setHistoryData] = useState<IHistoryData[]>([]);

	const items: TimelineItemProps[] = historyData?.map((item, index) =>
	{
		const date = new Date(item?.created_at);
		const title = item?.title || noTitle;
		// const difference = historyData[index+1] && historyData[index+1]?.content && item?.expanded ? diffChars(sanitizeMarkdown(historyData[index+1]?.content),  sanitizeMarkdown(item?.content)) : [];

		return {
			children: !item?.expanded ? <div className={'text-[#334D6E] h-[50px] ml-3 text-sm tracking-[0.01em] flex flex-col gap-2 -mt-1 font-medium max-sm:w-full max-sm:ml-0'}>
          Edited on {getRelativeCreatedAt(date)}
				<div className='text-pink_primary text-sm flex justify-start cursor-pointer -mt-2' onClick={() => handleExpand(index, EExpandType.Expanded)}>
					<span className='text-xs'>See Details</span></div>
			</div>
				: <div className={`py-3 px-3 bg-white rounded-[4px] mt-1 border-solid border-[0.5px] border-[#D2D8E0] ml-3 max-sm:w-full max-sm:ml-0 ${item?.expanded && 'active-timeline'}`}>
					<div className='flex items-center max-sm:flex-col max-sm:justify-start max-sm:gap-2  max-sm:items-start'>
						<div className='flex items-center max-sm:justify-start'>
							<span className='mr-1 text-xs text-[#90A0B7]'>By:</span>
							<NameLabel
								defaultAddress={defaultAddress}
								username={username}
								textClassName='text-xs text-[#334D6E]'
							/>
						</div>
						<div className='flex items-center'>
							<div className='rounded-[50%] bg-[#A0A6AE]  h-[3.5px] w-[3px] ml-1 mr-2 flex justify-center items-center mt-[1px]'/>
							<div className='flex items-center text-xs'>
								<span className='text-navBlue text-xs'>{getRelativeCreatedAt(date)}</span>
							</div>
						</div>
					</div>
					<div className='text-[#334D6E] text-[16px] mt-1 font-medium'>
						{historyData[index+1] ?  item?.title ? <div>{diffChars( historyData[index+1]?.title, item?.title)?.map((text, idx) => <span key={idx} className={`${text?.removed && 'bg-[#fff3b3]'}`}>{text.value}</span>)}</div> : title : title}
					</div>
					<div className={`mt-1 text-[#243A57] text-sm font-normal tracking-[0.01em] ${!item?.expandedContent && item?.content.length > 100 && 'truncate-content'} leading-6 pr-2`}>
						{/* {historyData[index+1] ? <div>{difference?.map((text, idx) => <span key={idx} className={`${text?.removed && 'bg-[#fff3b3]'} ${text?.added && 'bg-[#fff3b3]'}`}>{text.value}</span>)}</div> : item?.content} */}
						<Markdown className='text-sm' md={item?.content}/>
					</div>
					{item?.content.length > 100 && <span onClick={() => handleExpand(index, EExpandType.ExpandedContent)} className='text-xs cursor-pointer text-[#E5007A] font-medium mt-1'>{ item?.expandedContent ? 'Show less' : 'Show more'}</span>}
				</div>,
			dot: username && <UserAvatar
				className='flex-none hidden sm:inline-block -mb-1 -mt-1'
				username={username}
				size='large'
				id={user_id || 0}/>
			,
			key: index };});

	const handleExpand = (index: number, expandedType: EExpandType) => {
		const data = historyData.map((item, idx) => {
			if(idx === index ){
				if(expandedType === EExpandType.Expanded){
					if(item?.expanded ){
						return { ...item, expanded: !item?.expanded, expandedContent: false };
					}
					return { ...item, expanded: !item?.expanded };
				}
				else if(expandedType === EExpandType.ExpandedContent){
					return { ...item, expandedContent: !item?.expandedContent };
				}
			}

			return item;
		});
		setHistoryData(data);
	};

	useEffect(() => {
		setHistoryData(history.map((item, index) => {return index === 0 ? { ...item , expanded: true } : item; }));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	useEffect(() => {
		if(!historyData || !historyData.length) return;

		Array.from(document.querySelectorAll('.post-history-timeline .ant-timeline-item-tail'))?.map((element, index) => element.addEventListener('click', () => handleExpand(index, EExpandType.Expanded)) );

		return () => { Array.from(document.querySelectorAll('.post-history-timeline .ant-timeline-item-tail'))?.map((element, index) => element.removeEventListener('click', () => handleExpand(index, EExpandType.Expanded)) );};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [historyData]);

	return <Modal
		open={open}
		onCancel={() => setOpen(false)}
		wrapClassName={className}
		className={`closeIcon  w-[600px] shadow-[0px 8px 18px rgba(0, 0, 0, 0.06)] max-sm:w-full ${poppins.variable} ${poppins.className}`}
		footer={false}
		closeIcon={<CloseIcon/>}
		title={<label className='-mt-2 pr-3 text-[#334D6E] text-[20px] font-semibold '>Proposal Edit History</label>}
	>
		<div className='flex flex-col -mb-6 px-4 mt-9 post-history-timeline'>
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
  border-inline-start: 2px solid rgba(5, 5, 5, 0) !important;
  background-image: linear-gradient(rgba(144,160,183) 33%, rgba(255,255,255,0) 0%) !important;
  background-position: right !important;
  background-size: 1.5px 7px !important;
  background-repeat: repeat-y !important ;
  cursor: pointer !important;
}
.post-history-timeline .ant-timeline .ant-timeline-item:has(.active-timeline){
  .ant-timeline-item-tail{
  background-image: linear-gradient( rgba(229,0,122) 33%, rgba(255,255,255,0) 20%) !important;
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
.post-history-timeline .ant-timeline-item{
  padding-bottom: 30px !important;
}
.post-history-timeline .ant-timeline-item-content{
    inset-block-start:-8px !important;
  }
 .post-history-timeline .ant-timeline .ant-timeline-item-head-custom{
inset-block-start: 8px !important;
 }

`;