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

import { useApiContext } from '~src/context';
import { usePostDataContext } from '~src/context';
import { ProposalType, getProposalTypeTitle } from '~src/global/proposalType';
import PostHistoryModal from '~src/ui-components/PostHistoryModal';
import formatBnBalance from '~src/util/formatBnBalance';
import { onTagClickFilter } from '~src/util/onTagClickFilter';
import PostSummary from './PostSummary';
import { useNetworkSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import TagsModal from '~src/ui-components/TagsModal';
import styled from 'styled-components';

const CreationLabel = dynamic(() => import('src/ui-components/CreationLabel'), {
	loading: () => (
		<div className='flex gap-x-6'>
			<Skeleton.Avatar active />
			<Skeleton.Input active />
		</div>
	),
	ssr: false
});

interface IPostHeadingProps {
	className?: string;
}
const PostHeading: FC<IPostHeadingProps> = (props) => {
	const router = useRouter();
	const { className } = props;
	const { resolvedTheme: theme } = useTheme();

	const {
		postData: {
			beneficiaries,
			created_at,
			status,
			postType: proposalType,
			postIndex: onchainId,
			title,
			description,
			proposer,
			curator,
			username,
			topic,
			last_edited_at,
			requested,
			reward,
			tags,
			track_name,
			cid,
			history,
			content,
			summary,
			identityId
		}
	} = usePostDataContext();
	const { api, apiReady } = useApiContext();
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [polkadotProposer, setPolkadotProposer] = useState<string>('');
	const [openTagsModal, setOpenTagsModal] = useState<boolean>(false);
	const { network } = useNetworkSelector();

	const requestedAmt = proposalType === ProposalType.REFERENDUM_V2 ? requested : reward;

	const handleTagClick = (pathname: string, filterBy: string) => {
		if (pathname)
			router.replace({
				pathname: `/${pathname}`,
				query: {
					filterBy: encodeURIComponent(JSON.stringify([filterBy]))
				}
			});
	};
	const newTitle = title || description || noTitle;

	const getProposerFromPolkadot = async (identityId: string) => {
		if (!api || !apiReady) return;

		const didKeys = await api.query.identity.didKeys.keys(identityId);
		if (didKeys.length > 0) {
			const didKey = didKeys[0];
			const key = didKey.args[1].toJSON();
			return key;
		}
	};

	useEffect(() => {
		if (!identityId || proposer || curator) return;

		(async () => {
			const proposer = await getProposerFromPolkadot(identityId);
			setPolkadotProposer(proposer as string);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	return (
		<div className={className}>
			<div className='flex items-center justify-between'>
				{status && (
					<StatusTag
						theme={theme}
						className='mb-3'
						status={status}
					/>
				)}
				{requestedAmt && (
					<h5 className='text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
						Requested: {formatBnBalance(String(requestedAmt), { numberAfterComma: 2, withUnit: true }, network)}
					</h5>
				)}
			</div>
			<h2 className={`${proposalType === ProposalType.TIPS ? 'break-words' : ''} mb-3 text-lg font-medium leading-7 text-bodyBlue dark:text-blue-dark-high`}>
				{newTitle === noTitle ? (
					`${(getProposalTypeTitle(proposalType) || '')
						?.split(' ')
						?.map((v) => (v === 'referendumV2' ? 'Referenda' : v.charAt(0).toUpperCase() + v.slice(1)))
						.join(' ')} #${onchainId}`
				) : (
					<>
						{(onchainId || onchainId === 0) && !(proposalType === ProposalType.TIPS) && `#${onchainId}`} {newTitle}
					</>
				)}
			</h2>
			<div className='mb-3'>
				<>
					<CreationLabel
						className='md post-user-container  dark:bg-section-dark-overlay'
						created_at={dayjs(created_at).toDate()}
						defaultAddress={proposer || curator || polkadotProposer}
						username={username}
						topic={topic && topic?.name}
						cid={cid}
						isRow={false}
						beneficiaries={beneficiaries}
						inPostHeading={true}
					>
						{history && history?.length > 0 && (
							<div
								className='-ml-1 mr-1 mt-2 cursor-pointer md:mt-0'
								onClick={() => setOpenModal(true)}
							>
								<UpdateLabel
									className='md'
									created_at={created_at}
									updated_at={last_edited_at}
									isHistory={history && history?.length > 0}
								/>
							</div>
						)}
						<div className='post-heading-tags flex items-center'>
							<Divider
								className='mr-3'
								type='vertical'
								style={{ borderLeft: '1px solid #485F7D' }}
							/>
							{tags?.slice(0, 3).map((tag, index) => (
								<div
									key={index}
									className='traking-2 mr-1 cursor-pointer rounded-full border-[1px] border-solid border-navBlue px-[16px] py-[4px] text-xs text-navBlue hover:border-pink_primary hover:text-pink_primary'
									onClick={() => handleTagClick(onTagClickFilter(proposalType, track_name || ''), tag)}
								>
									{tag}
								</div>
							))}
							{tags.length > 3 && (
								<span
									className='mr-1 cursor-pointer text-bodyBlue dark:text-blue-dark-high'
									style={{ background: '#D2D8E080', borderRadius: '20px', padding: '4px 8px' }}
									onClick={(e) => {
										e.stopPropagation();
										e.preventDefault();
										setOpenTagsModal(true);
									}}
								>
									+{tags.length - 3}
								</span>
							)}
						</div>
						{summary ? (
							<>
								<Divider
									className='ml-1 xs:mt-2 xs:inline-block md:mt-0 md:hidden'
									type='vertical'
									style={{ borderLeft: '1px solid #485F7D' }}
								/>
								<PostSummary
									theme={theme}
									className='flex xs:mt-2 md:mt-0'
								/>
							</>
						) : null}
					</CreationLabel>
					<div className='tag-container mt-4 hidden items-center'>
						<div className='flex'>
							{tags?.slice(0, 2).map((tag, index) => (
								<div
									key={index}
									className='traking-2 mr-1 cursor-pointer rounded-full border-[1px] border-solid border-navBlue px-[16px] py-[4px] text-xs text-navBlue hover:border-pink_primary hover:text-pink_primary'
									onClick={() => handleTagClick(onTagClickFilter(proposalType, track_name || ''), tag)}
								>
									{tag}
								</div>
							))}
							{tags.length > 3 && (
								<span
									className='mr-1 cursor-pointer text-bodyBlue dark:text-blue-dark-high'
									style={{ background: '#D2D8E080', borderRadius: '20px', padding: '4px 8px' }}
									onClick={(e) => {
										e.stopPropagation();
										e.preventDefault();
										setOpenTagsModal(true);
									}}
								>
									+{tags.length - 2}
								</span>
							)}
						</div>
					</div>
				</>
			</div>
			{history && history.length > 0 && (
				<PostHistoryModal
					open={openModal}
					setOpen={setOpenModal}
					history={[{ content: content, created_at: last_edited_at || '', title: title }, ...history]}
					username={username}
					defaultAddress={proposer}
				/>
			)}
			<TagsModal
				tags={tags}
				track_name={track_name}
				proposalType={proposalType}
				openTagsModal={openTagsModal}
				setOpenTagsModal={setOpenTagsModal}
			/>
		</div>
	);
};

export default styled(PostHeading)`
	@media (max-width: 768px) and (min-width: 319px) {
		.post-heading-tags {
			display: none !important;
		}
		.tag-container {
			display: block !important;
		}
	}
`;
