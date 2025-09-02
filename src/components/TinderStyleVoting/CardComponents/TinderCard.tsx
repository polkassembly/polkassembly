// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState } from 'react';
import PostOnChainInfo from '../../Post/Tabs/PostOnChainInfo';
import { isOffChainProposalTypeValid } from '~src/api-utils';
import { useTheme } from 'next-themes';
import { Tabs } from '~src/ui-components/Tabs';
import CardPostHeading from '../PostInfoComponents/CardPostHeading';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { Button, Modal } from 'antd';
import classNames from 'classnames';
import { dmSans } from 'pages/_app';
import { CloseIcon, DetailsIcon, InfoIcon } from '~src/ui-components/CustomIcons';
import { useRouter } from 'next/router';
import InfoModalContent from './InfoModalContent';
import { useBatchVotesSelector } from '~src/redux/selectors';
import Markdown from '~src/ui-components/Markdown';

interface ITinderCards {
	post: any;
	proposalType?: any;
	onSkip?: any;
}

const TinderCards: FC<ITinderCards> = (props) => {
	const { post, proposalType } = props;
	const { resolvedTheme: theme } = useTheme();
	const router = useRouter();
	const { show_cart_menu } = useBatchVotesSelector();

	const [isModalVisible, setIsModalVisible] = useState(false);
	const sanitizeSummary = (md: string) => {
		return (md || '')?.trim();
	};

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
			children: (
				<section className='pr-2'>
					<p>
						<Markdown
							className='md text-sm font-normal leading-[26px] tracking-[0.14px] text-bodyBlue dark:text-blue-dark-high'
							md={sanitizeSummary(post?.summary || '')}
						/>
					</p>
				</section>
			),
			key: 'description',
			label: 'Description'
		},
		...getOnChainTabs()
	];

	const handleModalClose = () => {
		setIsModalVisible(false);
	};

	return (
		<div
			className={`flex ${
				show_cart_menu ? 'h-[calc(80vh-140px)]' : 'h-[calc(80vh-80px)]'
			}  flex-col gap-y-1 rounded-2xl bg-white p-4 px-4 py-6 shadow-md dark:border dark:border-solid dark:border-separatorDark dark:bg-black`}
		>
			<CardPostHeading
				method={post?.method}
				motion_method={post?.motion_method}
				postArguments={post?.proposed_call?.args}
				className=''
				post={post}
				isUsedInMainDisplay={true}
			/>
			<div className='overflow-y-hidden py-2'>
				<Tabs
					theme={theme}
					type='card'
					isPostTab={true}
					className='ant-tabs-tab-bg-white font-medium text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high'
					items={tabItems}
				/>
			</div>
			<div className='flex justify-center'>
				<Button
					className='mt-auto flex h-[36px] w-[170px] items-center justify-center border border-solid border-pink_primary bg-transparent text-sm text-pink_primary'
					onClick={() => {
						setIsModalVisible(true);
					}}
				>
					<InfoIcon className='mt-2 text-2xl text-pink_primary' />
					<DetailsIcon className='mt-[97px] text-8xl' />
				</Button>
			</div>
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				className={classNames(dmSans.className, dmSans.variable, 'z-100000 w-full dark:bg-black')}
				open={isModalVisible}
				footer={
					<div className='-mx-6 mt-9 flex items-center justify-center gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-2 pt-6'>
						<CustomButton
							variant='solid'
							text='Show More'
							className='w-full'
							buttonsize='sm'
							onClick={() => {
								router.push(`/referenda/${post?.id}`);
								handleModalClose();
							}}
						/>
					</div>
				}
				maskClosable={false}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={handleModalClose}
			>
				<InfoModalContent post={post} />
			</Modal>
		</div>
	);
};

export default TinderCards;
