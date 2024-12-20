// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider } from 'antd';
import { dayjs } from 'dayjs-init';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { FC, useEffect, useState } from 'react';
import { noTitle } from 'src/global/noTitle';
import UpdateLabel from 'src/ui-components/UpdateLabel';
import { useApiContext } from '~src/context';
import { ProposalType, getProposalTypeTitle } from '~src/global/proposalType';
import PostHistoryModal from '~src/ui-components/PostHistoryModal';
import { onTagClickFilter } from '~src/util/onTagClickFilter';
import { useNetworkSelector } from '~src/redux/selectors';
import TagsModal from '~src/ui-components/TagsModal';
import styled from 'styled-components';
import SkeletonInput from '~src/basic-components/Skeleton/SkeletonInput';
import SkeletonAvatar from '~src/basic-components/Skeleton/SkeletonAvatar';
import { IBeneficiary, IPostHistory } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ImageIcon from '~src/ui-components/ImageIcon';
import Alert from '~src/basic-components/Alert';
import getPreimageWarning from '../../Post/utils/getPreimageWarning';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import classNames from 'classnames';
import Popover from '~src/basic-components/Popover';

const CreationLabel = dynamic(() => import('src/ui-components/CreationLabel'), {
	loading: () => (
		<div className='flex gap-x-6'>
			<SkeletonAvatar active />
			<SkeletonInput active />
		</div>
	),
	ssr: false
});
const BeneficiaryAmoutTooltip = dynamic(() => import('../../BeneficiaryAmoutTooltip'), {
	loading: () => <div className='flex gap-x-6'></div>,
	ssr: false
});

interface ITagListingProps {
	className?: string;
	tags: string[];
	handleTagClick: (tag: string) => void;
	handleTagModalOpen: () => void;
	maxTags: number;
}

const TagsListing = ({ className, tags, handleTagClick, handleTagModalOpen, maxTags }: ITagListingProps) => {
	return (
		<div className={`${className} flex items-center`}>
			{tags?.slice(0, maxTags).map((tag, index) => (
				<div
					key={index}
					className='traking-2 mr-1 inline-flex cursor-pointer rounded-full border-[1px] border-solid border-navBlue px-[16px] py-[4px] text-xs text-navBlue hover:border-pink_primary hover:text-pink_primary dark:border-section-dark-container dark:text-[#C1C1C1]'
					onClick={() => handleTagClick(tag)}
				>
					{tag}
				</div>
			))}
			{tags?.length > maxTags && (
				<span
					className='mr-1 cursor-pointer bg-[#D2D8E080] text-bodyBlue dark:bg-[#222222] dark:text-[#8B8B8B]'
					style={{ borderRadius: '20px', padding: '4px 8px' }}
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
						handleTagModalOpen();
					}}
				>
					+{tags?.length - maxTags}
				</span>
			)}
		</div>
	);
};

interface ICardPostHeadingProps {
	className?: string;
	postArguments?: any;
	method?: string;
	motion_method?: string;
	post?: any;
	isUsedInMainDisplay?: boolean;
}
const CardPostHeading: FC<ICardPostHeadingProps> = (props) => {
	const router = useRouter();
	const { className, postArguments, method, motion_method, post, isUsedInMainDisplay } = props;
	const {
		assetId,
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
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		requested,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		reward,
		tags,
		track_name,
		timeline,
		cid,
		// history,
		content,
		identityId,
		hash,
		preimageHash
	} = post;
	const { api, apiReady } = useApiContext();
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [polkadotProposer, setPolkadotProposer] = useState<string>('');
	const [openTagsModal, setOpenTagsModal] = useState<boolean>(false);
	const { network } = useNetworkSelector();
	const [history, setHistory] = useState<IPostHistory[]>([]);
	const [cancelledReferendaIndices, setCancelledReferendaIndices] = useState<number[]>([]);
	const [isTreasuryProposal, setIsTreasuryProposal] = useState<boolean>(false);
	const [preimageWarning, setPreimageWarning] = useState<string | null>(null);

	const getHistoryData = async () => {
		try {
			const { data } = await nextApiClientFetch<IPostHistory[]>(`/api/v1/posts/editHistory?postId=${onchainId}&proposalType=${proposalType}`);
			if (data) {
				setHistory(data);
			}
		} catch (error) {
			console.error('Error fetching history data:', error);
		}
	};

	useEffect(() => {
		if (!onchainId && !proposalType) return;
		if (String(onchainId) === '866' && proposalType === 'referendums_v2' && window.location.href.includes('polkadot')) return; //TODO: just a hotfix, remove later, network selector returns empty please check

		getHistoryData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onchainId, proposalType, network]);

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

		const didKeys = (await api.query?.identity?.didKeys?.keys(identityId)) || [];
		if (didKeys?.length > 0) {
			const didKey = didKeys[0];
			const key = didKey.args[1].toJSON();
			return key;
		}
	};

	const handlePreimageWarning = async (isTreasuryProposal: boolean) => {
		if (!api || !apiReady || !isTreasuryProposal || ['Cancelled', 'TimedOut', 'Confirmed', 'Approved', 'Rejected', 'Executed', 'Killed', 'ExecutionFailed'].includes(status)) {
			return;
		}
		const { preimageWarning = null } = await getPreimageWarning({ api: api, apiReady: apiReady, preimageHash: hash || preimageHash || '' });
		setPreimageWarning(preimageWarning);
	};

	useEffect(() => {
		let isTreasuryProposal = false;
		if (network && track_name) {
			isTreasuryProposal = networkTrackInfo?.[network]?.[track_name].group === 'Treasury';
			setIsTreasuryProposal(isTreasuryProposal);
		}

		if (!api || !apiReady) return;
		handlePreimageWarning(isTreasuryProposal);

		if (identityId && !proposer && !curator) {
			(async () => {
				const proposer = await getProposerFromPolkadot(identityId);
				setPolkadotProposer(proposer as string);
			})();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, network]);

	const CancelledReferendaIndices = () => {
		if (!postArguments) return;
		const indices = Object.entries(postArguments).map(([, value]) => Number(value));
		setCancelledReferendaIndices(indices);
	};

	useEffect(() => {
		CancelledReferendaIndices();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postArguments]);

	return (
		<div className={className}>
			{isTreasuryProposal && preimageWarning && proposalType == ProposalType.REFERENDUM_V2 && (
				<Alert
					key={preimageHash}
					message={<div className='flex items-center gap-1 text-xs'>{preimageWarning}</div>}
					type='warning'
					className='mb-4 mt-2'
					showIcon
				/>
			)}
			{method && method !== motion_method && method == 'cancel' ? (
				<div>
					{cancelledReferendaIndices.map((index) => {
						return (
							<Alert
								key={index}
								message={
									<div className='flex items-center gap-1'>
										<span className='text-xs font-normal text-[#EA0707] dark:text-blue-dark-medium'>This Referendum has been created to cancel </span>
										<a
											href={`https://${network}.polkassembly.io/referenda/${index}`}
											target='_blank'
											rel='noreferrer'
											className='flex items-center space-x-1 text-xs font-medium text-pink_primary dark:text-pink_light'
										>
											Referendum #{index}
											<ImageIcon
												src='/assets/icons/redirect.svg'
												alt='redirection-icon'
												imgClassName='ml-1 w-[14px] -mt-[2px]'
											/>
										</a>
									</div>
								}
								type='error'
								className='mb-4 mt-2'
							/>
						);
					})}
				</div>
			) : (
				<div className='flex items-center justify-between'>
					{!!post?.requested && (
						<div className='flex gap-1 text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
							<span> Requested: </span>
							{post?.beneficiaries?.length ? (
								post?.beneficiaries?.slice(0, 1)?.map((beneficiary: IBeneficiary) => {
									return (
										<BeneficiaryAmoutTooltip
											key={beneficiary?.address}
											assetId={beneficiary?.genralIndex || null}
											requestedAmt={beneficiary?.amount.toString()}
											className={classNames(className, 'flex')}
											postId={onchainId ? Number(onchainId) : (onchainId as any)}
											proposalCreatedAt={created_at as any}
											timeline={timeline || []}
											usedInPostPage
										/>
									);
								})
							) : (
								<BeneficiaryAmoutTooltip
									assetId={null}
									requestedAmt={post?.requested.toString()}
									className={'flex items-center text-xs'}
									postId={onchainId ? Number(onchainId) : (onchainId as any)}
									proposalCreatedAt={created_at as any}
									timeline={timeline || []}
									usedInPostPage
								/>
							)}
							{post?.beneficiaries && post?.beneficiaries?.length > 1 && (
								<>
									<Popover
										trigger='hover'
										content={
											<div className='flex flex-col items-start gap-1'>
												{post?.beneficiaries?.slice(1, post?.beneficiaries?.length)?.map((beneficiary: IBeneficiary) => {
													return (
														<BeneficiaryAmoutTooltip
															key={beneficiary?.address}
															assetId={beneficiary?.genralIndex || null}
															requestedAmt={beneficiary?.amount.toString()}
															className={'flex items-center text-xs'}
															postId={onchainId ? Number(onchainId) : (onchainId as any)}
															proposalCreatedAt={created_at as any}
															timeline={timeline || []}
															usedInPostPage
														/>
													);
												})}
											</div>
										}
									>
										<div className='mt-0.5 cursor-pointer text-xs text-[#407BFF]'> & {post?.beneficiaries?.length - 1} more</div>
									</Popover>
								</>
							)}
						</div>
					)}
				</div>
			)}

			<h2
				className={`${proposalType === ProposalType?.TIPS ? 'break-words' : ''} mb-3 ${
					isUsedInMainDisplay ? 'text-sm font-medium leading-5' : 'text-lg font-medium leading-7'
				} text-bodyBlue dark:text-blue-dark-high`}
			>
				#{post?.id}
				{newTitle === noTitle ? (
					`${(getProposalTypeTitle(proposalType) || '')
						?.split(' ')
						?.map((v) => (v === 'referendumV2' ? 'Referenda' : v.charAt(0).toUpperCase() + v.slice(1)))
						.join(' ')} ${proposalType === ProposalType.ADVISORY_COMMITTEE ? 'Motion ' : ''}${
						onchainId !== undefined || onchainId === 0 ? `#${onchainId}` : `${hash ? `${hash.slice(0, 5)}...${hash.slice(-5)}` : ''}`
					}`
				) : (
					<>
						{(onchainId || onchainId === 0) && !(proposalType === ProposalType.TIPS) && `#${onchainId}`} {isUsedInMainDisplay ? `${newTitle?.slice(0, 30)}...` : newTitle}
					</>
				)}
			</h2>
			<div className='mb-3'>
				<>
					<CreationLabel
						assetId={assetId}
						className='md post-user-container dark:bg-transparent'
						created_at={dayjs(created_at).toDate()}
						defaultAddress={proposer || curator || polkadotProposer}
						username={username}
						topic={topic && topic?.name}
						cid={cid}
						isRow={false}
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
						{tags && tags?.length > 0 && (
							<>
								<Divider
									className='mr-3 hidden md:inline-block'
									type='vertical'
									style={{ borderLeft: '1px solid var(--lightBlue)' }}
								/>
								<TagsListing
									tags={tags}
									handleTagClick={(tag: string) => handleTagClick(onTagClickFilter(proposalType, track_name || ''), tag)}
									handleTagModalOpen={() => {
										setOpenTagsModal(true);
									}}
									maxTags={3}
									className='post-heading-tags'
								/>
							</>
						)}
					</CreationLabel>
					{tags && tags?.length > 0 && (
						<TagsListing
							tags={tags}
							handleTagClick={(tag: string) => handleTagClick(onTagClickFilter(proposalType, track_name || ''), tag)}
							handleTagModalOpen={() => {
								setOpenTagsModal(true);
							}}
							maxTags={3}
							className='post-heading-tags mt-1.5'
						/>
					)}
					{/* for mobile */}
					<TagsListing
						tags={tags}
						handleTagClick={(tag: string) => handleTagClick(onTagClickFilter(proposalType, track_name || ''), tag)}
						handleTagModalOpen={() => {
							setOpenTagsModal(true);
						}}
						maxTags={2}
						className='tag-container mt-1.5 hidden'
					/>
				</>
			</div>
			{history && history?.length > 0 && (
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

export default styled(CardPostHeading)`
	@media (max-width: 768px) and (min-width: 319px) {
		.post-heading-tags {
			display: none !important;
		}
		.tag-container {
			display: block !important;
		}
	}
`;
