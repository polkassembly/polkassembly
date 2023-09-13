// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider, Skeleton } from 'antd';
import { dayjs } from 'dayjs-init';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { FC, useEffect, useState } from 'react';
import { noTitle } from 'src/global/noTitle';
import StatusTag from 'src/ui-components/StatusTag';
import UpdateLabel from 'src/ui-components/UpdateLabel';

import { useApiContext, useNetworkContext } from '~src/context';
import { usePostDataContext } from '~src/context';
import { ProposalType, getProposalTypeTitle } from '~src/global/proposalType';
import PostHistoryModal from '~src/ui-components/PostHistoryModal';
import formatBnBalance from '~src/util/formatBnBalance';
import { onTagClickFilter } from '~src/util/onTagClickFilter';
import PostSummary from './PostSummary';

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
		created_at, status, postType: proposalType, postIndex: onchainId, title, description, proposer, curator, username, topic, last_edited_at, requested, reward,tags, track_name, cid, history, content, summary, identityId
	} } = usePostDataContext();
	const { api, apiReady } = useApiContext();
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [polkadotProposer, setPolkadotProposer ] = useState<string>('');

	const { network } = useNetworkContext();

	const requestedAmt = proposalType === ProposalType.REFERENDUM_V2? requested: reward;

	const handleTagClick=(pathname:string,filterBy:string) => {
		if(pathname) (
			router.replace({ pathname:`/${pathname}`,query:{
				filterBy:encodeURIComponent(JSON.stringify([filterBy]))
			} }));
	};
	const newTitle = title || description || noTitle;

	const getProposerFromPolkadot= async(identityId: string) => {
		if(!api || !apiReady) return;

		const didKeys = await api.query.identity.didKeys.keys(identityId);
		if(didKeys.length > 0){
			const didKey = didKeys[0];
			const key = didKey.args[1].toJSON();
			return key;
		}
	};

	useEffect(() => {

		if(!identityId || proposer || curator) return;

		(async() => {
			const proposer = await getProposerFromPolkadot(identityId );
			setPolkadotProposer(proposer as string);
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[api, apiReady]);

	return (
		<div className={className} >
			<div className="flex justify-between items-center">
				{status && <StatusTag className='mb-3' status={status}/>}
				{ requestedAmt && <h5 className='text-sm text-blue-light-high dark:text-blue-dark-high font-medium'>Requested: {formatBnBalance(String(requestedAmt), { numberAfterComma: 2, withUnit: true }, network)}</h5>}
			</div>
			<h2 className='text-lg text-blue-light-high dark:text-blue-dark-high font-medium mb-3 leading-7'>
				{
					newTitle === noTitle?
						`${(getProposalTypeTitle(proposalType) || '')?.split(' ')?.map((v) => v === 'referendumV2'? 'Referenda': v.charAt(0).toUpperCase() + v.slice(1)).join(' ')} #${onchainId}`
						: <>{(onchainId || onchainId === 0) && !(proposalType === ProposalType.TIPS) && `#${onchainId}`} {newTitle}</>
				}
			</h2>
			<div className='mb-3'>
				<>
					<CreationLabel
						className='md'
						created_at={dayjs(created_at).toDate()}
						defaultAddress={proposer || curator || polkadotProposer}
						username={username}
						topic={topic && topic?.name}
						cid={cid}
						isRow={false}
					>
						{ history && history?.length > 0 &&
							<div className='cursor-pointer mt-2 md:mt-0' onClick={() => setOpenModal(true)}>
								<UpdateLabel
									className='md'
									created_at={created_at}
									updated_at={last_edited_at}
									isHistory={history && history?.length > 0}
								/>
							</div>
						}
						{
							summary?
								<>
									<Divider
										className='ml-1 xs:mt-2 md:mt-0 xs:inline-block md:hidden'
										type="vertical"
										style={{ borderLeft: '1px solid #485F7D' }} />
									<PostSummary className='flex xs:mt-2 md:mt-0' />
								</>
								: null
						}
					</CreationLabel>
				</>
			</div>
			{tags && tags.length>0 &&<div className='flex mt-3.5 gap-[8px] flex-wrap'>
				{tags?.map((tag,index ) => (<div onClick={() => handleTagClick(onTagClickFilter(proposalType, track_name || ''),tag)} className='rounded-full px-[16px] py-[4px] border-navBlue border-solid border-[1px] text-navBlue text-xs traking-2 cursor-pointer hover:border-pink_primary hover:text-pink_primary' key={index} >{tag}</div>))}
			</div> }
			{history  && history.length > 0 && <PostHistoryModal open={openModal} setOpen={setOpenModal} history={[{ content: content, created_at: last_edited_at || '', title: title },...history]} username={username} defaultAddress={proposer} />}
		</div>
	);
};

export default PostHeading;