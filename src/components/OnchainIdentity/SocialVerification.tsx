// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Timeline, TimelineItemProps } from 'antd';
import styled from 'styled-components';
import { EmailIcon, TwitterIcon } from '~src/ui-components/CustomIcons';
import { ISocials } from '.';

interface Props{
  className?: string;
  socials: ISocials;
  address: string;
  startLoading: (pre: boolean) => void;
  onCancel:()=> void;
  changeStep: (pre: number) => void;
  closeModal: (pre: boolean) => void;
}
const SocialVerification = ({ className, address, changeStep, startLoading, onCancel, closeModal }: Props) => {

	const items: TimelineItemProps[] = [
		{
			children: <div className='ml-2 text-lightBlue h-[70px] flex gap-5'>
				<span className='text-sm w-[60px] py-1.5'>Email</span>
				<div className='w-full'>
					<div className='border-solid border-[1px] text-bodyBlue flex items-center justify-between border-[#D2D8E0] h-[40px] rounded-[4px] pl-3 pr-2 tracking-wide'>
						<span>kanisla@gmail.com</span>
						<Button className='bg-pink_primary text-xs font-medium text-white h-[30px] w-[68px] tracking-wide rounded-[4px]'>Verify</Button>
					</div>
					<span className='text-xs'>Check your primary inbox or Spam to verify your email address.</span>
				</div>
			</div>,
			dot: <EmailIcon className='bg-[#edeff3] rounded-full text-xl p-2.5 text-[#576D8B]'/>,
			key: 1
		},
		{
			children: <div className='ml-2 text-lightBlue h-[70px] flex gap-5'>
				<span className='text-sm w-[60px] py-1.5'>Twitter</span>
				<div className='w-full'>
					<div className='border-solid border-[1px] text-bodyBlue flex items-center justify-between border-[#D2D8E0] h-[40px] rounded-[4px] pl-3 pr-2 tracking-wide'>
						<span>kanisla@gmail.com</span>
						<Button className='bg-pink_primary text-xs font-medium text-white h-[30px] w-[68px] tracking-wide rounded-[4px]'>Verify</Button>
					</div>
					<span className='text-xs'>Check your messages to verify your twitter username.</span>
				</div>
			</div>,
			dot: <TwitterIcon className='bg-[#edeff3] rounded-full text-xl p-2.5 text-[#576D8B]'/>,
			key: 2
		}
	];

	return <div className={`${className} mt-8 pl-4`}>
		<Timeline
			items={ items }
		/>
		<div className='-mx-6 mt-6 border-0 border-solid flex justify-end border-t-[1px] gap-4 px-6 pt-5 border-[#E1E6EB] rounded-[4px]'>
			<Button onClick={onCancel} className='border-pink_primary text-sm border-[1px]  h-[40px] rounded-[4px] w-[134px] text-pink_primary tracking-wide'>
               Cancel
			</Button>
			<Button
				className={`bg-pink_primary text-sm rounded-[4px] h-[40px] w-[134px] text-white tracking-wide ${(!true) && 'opacity-50'}`}
				onClick={() => {closeModal(true);}}>
            Proceed
			</Button>
		</div>
	</div>;
};
export default styled(SocialVerification)`
.ant-timeline .ant-timeline-item-tail{
  border-inline-start: 2px solid rgba(5, 5, 5, 0) !important;
  background-image: linear-gradient(rgba(144,160,183) 33%, rgba(255,255,255,0) 0%) !important;
  background-position: right !important;
  background-size: 1.5px 7px !important;
  background-repeat: repeat-y !important ;
  cursor: pointer !important;
}
.ant-timeline .ant-timeline-item-content {
    inset-block-start: -10px;
`;