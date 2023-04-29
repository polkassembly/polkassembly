// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton } from 'antd';
import { dayjs } from 'dayjs-init';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { FC } from 'react';
import { noTitle } from 'src/global/noTitle';
import StatusTag from 'src/ui-components/StatusTag';
import UpdateLabel from 'src/ui-components/UpdateLabel';

import { useNetworkContext } from '~src/context';
import { usePostDataContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import formatBnBalance from '~src/util/formatBnBalance';
import { onTagClickFilter } from '~src/util/onTagClickFilter';

const CreationLabel = dynamic(() => import('src/ui-components/CreationLabel'), {
	loading: () => <div className="flex gap-x-6"><Skeleton.Avatar active /><Skeleton.Input active /></div> ,
	ssr: false
});

interface IPostHeadingProps {
	className?: string;
}
const PostHeading: FC<IPostHeadingProps> = (props) => {
	const router= useRouter();
	const { className } = props;
	const { postData: {
		created_at, status, postType: proposalType, postIndex: onchainId, title, description, proposer, curator, username, topic, last_edited_at, requested, reward,tags, track_name, cid
	} } = usePostDataContext();

	const { network } = useNetworkContext();

	const requestedAmt = proposalType === ProposalType.REFERENDUM_V2? requested: reward;

	const handleTagClick=(pathname:string,filterBy:string) => {
		if(pathname !== '') (
			router.replace({ pathname:`/${pathname}`,query:{
				filterBy:encodeURIComponent(JSON.stringify([filterBy]))
			} }));
	};
	return (
		<div className={className} >
			<div className="flex justify-between items-center">
				{status && <StatusTag className='mb-3' status={status}/>}
				{ requestedAmt && <h5 className='text-sm text-sidebarBlue font-medium'>Requested: {formatBnBalance(String(requestedAmt), { numberAfterComma: 2, withUnit: true }, network)}</h5>}
			</div>
			<h2 className='text-lg text-sidebarBlue font-medium mb-1'>
				{(onchainId || onchainId === 0) && !(proposalType === ProposalType.TIPS) && `#${onchainId}`} {title || description || noTitle}
			</h2>
			<div className='mb-8'>
				<>
					<CreationLabel
						className='md'
						created_at={dayjs(created_at).toDate()}
						defaultAddress={proposer || curator}
						username={username}
						topic={topic && topic?.name}
						cid={cid}
					>
						<UpdateLabel
							className='md'
							created_at={created_at}
							updated_at={last_edited_at}
						/>
					</CreationLabel>
				</>
			</div>
			{tags && tags.length>0 &&<div className='flex mt-6 gap-[8px]'>
				{tags?.map((tag,index ) => (<div onClick={() => handleTagClick(onTagClickFilter(proposalType, track_name || ''),tag)} className='rounded-full px-[16px] py-[4px] border-navBlue border-solid border-[1px] text-navBlue text-xs traking-2 cursor-pointer hover:border-pink_primary hover:text-pink_primary' key={index} >{tag}</div>))}
			</div> }
		</div>
	);
};

export default PostHeading;