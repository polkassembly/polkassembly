// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, message } from 'antd';

import React, { FC } from 'react';
import ImageComponent from '~src/components/ImageComponent';
import { MinusCircleFilled } from '@ant-design/icons';

import CopyIcon from '~assets/icons/content_copy_small.svg';
import { VerifiedIcon } from '~src/ui-components/CustomIcons';
import copyToClipboard from '~src/util/copyToClipboard';
import EvalutionSummary from '../../PostSummary/EvalutionSummary';
import MessageIcon from '~assets/icons/ChatIcon.svg';
import ClipBoardIcon from '~assets/icons/ClipboardText.svg';
import CalenderIcon from '~assets/icons/Calendar.svg';

interface IProposerData {
	className?: string;
	address?: any;
	profileData?: any;
	isGood?: any;
}

const ProposerData: FC<IProposerData> = (props) => {
	const { className, address, profileData, isGood } = props;

	const [messageApi, contextHolder] = message.useMessage();

	const success = () => {
		messageApi.open({
			content: 'Address copied to clipboard',
			duration: 10,
			type: 'success'
		});
	};

	console.log(profileData);

	return (
		<div className={`${className}`}>
			<div className='flex gap-x-4'>
				<div className='h-[60px] w-[60px]'>
					<ImageComponent
						src={profileData?.profile?.image}
						alt='User Picture'
						className='flex h-[60px] w-[60px] items-center justify-center bg-transparent'
						iconClassName='flex items-center justify-center text-[#FCE5F2] text-xxl w-full h-full rounded-full'
					/>
				</div>
				<div>
					<div className='flex gap-x-1'>
						<p className='text-base font-semibold text-bodyBlue dark:text-white'>
							{profileData?.username && profileData?.username?.length > 15 ? `${profileData?.username?.slice(0, 15)}...` : profileData?.username}
						</p>
						<p className='w-[120px] truncate text-base text-bodyBlue dark:text-white'>({address})</p>
						<div className='mt-0.5'>{isGood ? <VerifiedIcon className='text-xl' /> : <MinusCircleFilled />}</div>
						<span
							className='-mt-4 flex cursor-pointer items-center'
							onClick={(e) => {
								e.preventDefault();
								copyToClipboard(address);
								success();
							}}
						>
							{contextHolder}
							<CopyIcon />
						</span>
					</div>
					{!profileData?.profile?.bio && (
						<div>
							<p className='text-sm text-textGreyColor'>
								Lorem ipsum dolor, sit amet consectetur adipisicing elit. Reiciendis, voluptatibus, eum enim sunt et alias repudiandae repellat molestias quis odit, quia illo quod
								molestiae accusantium fuga hic commodi esse. Consequuntur quas reiciendis pariatur officia rerum, perspiciatis temporibus quae necessitatibus sed atque debitis
								minus enim unde nam modi qui deleniti quibusdam exercitationem illo et magnam at iure? Accusamus nesciunt sint mollitia.
							</p>
							<p className='text-sm text-textGreyColor'>{profileData?.profile?.bio}</p>
						</div>
					)}
					<div>
						<EvalutionSummary isUsedInEvaluationTab={true} />
					</div>
				</div>
			</div>
			<Divider
				style={{ background: '#D2D8E0', flexGrow: 1 }}
				className='mb-0 mt-2 dark:bg-separatorDark'
			/>
			<div className='mt-2 flex h-[60px] divide-x divide-gray-300'>
				<div className='flex w-1/4 items-center justify-center p-4'>
					<CalenderIcon />
					<div>hello 1</div>
				</div>
				<Divider
					type='vertical'
					className='h-[40px]'
				/>
				<div className='flex w-1/4 items-center justify-center p-4'>
					<ClipBoardIcon />
					<div>hello 2</div>
				</div>
				<Divider
					type='vertical'
					className='h-[40px]'
				/>
				<div className='flex w-1/4 items-center justify-center p-4'>
					<MessageIcon />
					<div>Hello 3</div>
				</div>
				<Divider
					type='vertical'
					className='h-[40px]'
				/>
				<div className='flex w-1/4 items-center justify-center p-4'>
					<MessageIcon />
					<div>Hello 4</div>
				</div>
			</div>
		</div>
	);
};

export default ProposerData;
