// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import PostOnChainInfo from '../../Post/Tabs/PostOnChainInfo';
import { isOffChainProposalTypeValid } from '~src/api-utils';
import { useTheme } from 'next-themes';
import { Tabs } from '~src/ui-components/Tabs';
import CardPostHeading from '../PostInfoComponents/CardPostHeading';
import TinderPostDescription from '../PostInfoComponents/TinderPostDescription';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useDispatch } from 'react-redux';
import { batchVotesActions } from '~src/redux/batchVoting';
import { Button, Modal } from 'antd';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import { useBatchVotesSelector } from '~src/redux/selectors';
import { CloseIcon, DetailsIcon, InfoIcon } from '~src/ui-components/CustomIcons';
import { useRouter } from 'next/router';
import InfoModalContent from './InfoModalContent';

interface ITinderCards {
	post: any;
	proposalType?: any;
	onSkip?: any;
}

const TinderCards: FC<ITinderCards> = (props) => {
	const { post, proposalType, onSkip } = props;
	const { resolvedTheme: theme } = useTheme();
	const router = useRouter();
	const dispatch = useDispatch();
	const { show_post_info } = useBatchVotesSelector();

	const getOnChainTabs = () => {
		const tabs: any[] = [];

		if (!isOffChainProposalTypeValid(proposalType)) {
			tabs.push({
				children: (
					<PostOnChainInfo
						onChainInfo={{
							assetId: post?.assetId || null,
							beneficiaries: post?.beneficiaries || [],
							bond: post?.bond,
							cid: post?.cid,
							code: post?.code,
							codec: post?.codec,
							curator: post?.curator,
							curator_deposit: post?.curator_deposit,
							deciding: post?.deciding,
							decision_deposit_amount: post?.decision_deposit_amount,
							delay: post?.delay,
							deposit: post?.deposit,
							description: post?.description,
							enactment_after_block: post.enactment_after_block,
							enactment_at_block: post.enactment_at_block,
							end: post?.end,
							ended_at: post?.ended_at,
							ended_at_block: post?.ended_at_block,
							fee: post?.fee,
							hash: post?.hash,
							marketMetadata: post?.marketMetadata || null,
							member_count: post?.member_count,
							method: post?.method,
							motion_method: post?.motion_method,
							origin: post?.origin,
							payee: post?.payee,
							post_id: post?.post_id,
							proposal_arguments: post?.proposal_arguments,
							proposed_call: post?.proposed_call,
							proposer: post?.proposer,
							reward: post?.reward,
							status: post?.status,
							statusHistory: post?.statusHistory,
							submission_deposit_amount: post?.submission_deposit_amount,
							submitted_amount: post?.submitted_amount,
							track_number: post?.track_number,
							version: post?.version,
							vote_threshold: post?.vote_threshold
						}}
						proposalType={proposalType}
					/>
				),
				key: 'onChainInfo',
				label: 'On Chain Info'
			});
		}

		return tabs;
	};

	const tabItems: any[] = [
		{
			children: <TinderPostDescription postContent={post?.summary} />,
			key: 'description',
			label: 'Description'
		},
		...getOnChainTabs()
	];

	return (
		<div className='flex h-[600px] flex-col gap-y-1 rounded-2xl bg-white p-4 px-4 py-6 shadow-md dark:border dark:border-solid dark:border-separatorDark dark:bg-black'>
			<Button
				className='ml-auto border-none bg-transparent p-0'
				onClick={() => {
					console.log('skip clicked');
					onSkip(post.id);
				}}
			>
				<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />
			</Button>
			<CardPostHeading
				method={post?.method}
				motion_method={post?.motion_method}
				postArguments={post?.proposed_call?.args}
				className=''
				post={post}
			/>
			<div className='h-[250px] overflow-y-hidden py-2'>
				<Tabs
					theme={theme}
					type='card'
					isPostTab={true}
					className='ant-tabs-tab-bg-white font-medium text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high'
					items={tabItems}
				/>
			</div>
			<Button
				className='mt-6 flex h-[40px] w-full items-center justify-center border border-solid border-pink_primary bg-transparent text-sm text-pink_primary'
				onClick={() => {
					console.log('btn clicked');
					dispatch(batchVotesActions.setShowPostInfo(true));
				}}
			>
				<div className='flex items-center gap-x-2'>
					<InfoIcon className='text-2xl text-pink_primary' />
					<DetailsIcon className='mt-[82px] text-8xl' />
				</div>
			</Button>
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				className={classNames(poppins.className, poppins.variable, 'w-[600px]')}
				open={show_post_info}
				// open={true}
				footer={
					<div className='-mx-6 mt-9 flex items-center justify-center gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-2 pt-6'>
						<CustomButton
							variant='default'
							text='View Details'
							className='w-full'
							buttonsize='sm'
							onClick={() => {
								router.push(`/referenda/${post?.id}`);
								dispatch(batchVotesActions.setShowPostInfo(false));
							}}
						/>
					</div>
				}
				maskClosable={false}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={() => {
					dispatch(batchVotesActions.setShowPostInfo(false));
				}}
			>
				<InfoModalContent post={post} />
			</Modal>
		</div>
	);
};

export default TinderCards;
