// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined, DeleteOutlined, LinkOutlined, LoadingOutlined } from '@ant-design/icons';
import { Form, Modal, Spin } from 'antd';
import { ILinkPostConfirmResponse } from 'pages/api/v1/auth/actions/linkPostConfirm';
import { ILinkPostRemoveResponse } from 'pages/api/v1/auth/actions/linkPostRemove';
import { ILinkPostStartResponse } from 'pages/api/v1/auth/actions/linkPostStart';
import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { isOffChainProposalTypeValid } from '~src/api-utils';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Input from '~src/basic-components/Input';
import Select from '~src/basic-components/Select';
import { usePostDataContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import { NotificationStatus } from '~src/types';
import Markdown from '~src/ui-components/Markdown';
import queueNotification from '~src/ui-components/QueueNotification';
import { ErrorState } from '~src/ui-components/UIStates';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

const onChainOptions = [
	{
		label: 'Democracy Proposals',
		value: ProposalType.DEMOCRACY_PROPOSALS.toString()
	},
	{
		label: 'Tech Committee Proposals',
		value: ProposalType.TECH_COMMITTEE_PROPOSALS.toString()
	},
	{
		label: 'Treasury Proposals',
		value: ProposalType.TREASURY_PROPOSALS.toString()
	},
	{
		label: 'Referendums',
		value: ProposalType.REFERENDUMS.toString()
	},
	{
		label: 'Fellowship Referendums',
		value: ProposalType.FELLOWSHIP_REFERENDUMS.toString()
	},
	{
		label: 'Motions',
		value: ProposalType.COUNCIL_MOTIONS.toString()
	},
	{
		label: 'Bounties',
		value: ProposalType.BOUNTIES.toString()
	},
	{
		label: 'Tips',
		value: ProposalType.TIPS.toString()
	},
	{
		label: 'OpenGov',
		value: ProposalType.OPEN_GOV.toString()
	}
];

const offChainOptions = [
	{
		label: 'Discussions',
		value: ProposalType.DISCUSSIONS.toString()
	},
	{
		label: 'Grants',
		value: ProposalType.GRANTS.toString()
	}
];

interface ILinkPostModalProps {
	className?: string;
	setNewTitle: (title: string) => void;
	setNewContent: (content: string) => void;
	currPostId: string | number;
	currPostType: ProposalType;
}

const LinkPostModal: FC<ILinkPostModalProps> = (props) => {
	const { className, currPostId, currPostType } = props;
	const { postData, setPostData } = usePostDataContext();
	const [showModal, setShowModal] = useState<boolean>(false);
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState('');
	const [postId, setPostId] = useState<number | string>();
	const [data, setData] = useState<ILinkPostStartResponse>();
	const [options, setOptions] = useState<
		{
			label: string;
			value: string;
		}[]
	>([]);
	const [postType, setPostType] = useState('');
	const [footer, setFooter] = useState<React.ReactNode>([]);

	const handleSubmit = async () => {
		setErr('');
		setFormDisabled(true);
		setLoading(true);
		// TODO: validate: match discussion post and onchain post author match;
		try {
			const { data, error } = await nextApiClientFetch<ILinkPostStartResponse>('api/v1/auth/actions/linkPostStart', {
				postId,
				postType
			});
			if (error) {
				setErr(error);
			} else {
				setData(data);
			}
		} catch (error) {
			console.error((error && error?.message) || error);
		}
		setFormDisabled(false);
		setLoading(false);
	};
	const handleConfirm = async () => {
		setErr('');
		setFormDisabled(true);
		setLoading(true);
		// TODO: validate: match discussion post and onchain post author match;
		try {
			const { data: resData, error } = await nextApiClientFetch<ILinkPostConfirmResponse>('api/v1/auth/actions/linkPostConfirm', {
				currPostId,
				currPostType,
				postId,
				postType
			});
			if (error) {
				setErr(error);
			}
			if (resData && resData.timeline) {
				setPostData((prev) => ({
					...prev,
					post_link: {
						description: data?.description,
						id: postId,
						title: data?.title,
						type: postType
					},
					timeline: resData.timeline || []
				}));
				queueNotification({
					header: 'Success',
					message: 'Successfully post linked.',
					status: NotificationStatus.SUCCESS
				});
			}
		} catch (error) {
			console.error((error && error?.message) || error);
		}
		setFormDisabled(false);
		setLoading(false);
		setShowModal(false);
	};
	const handleRemove = async () => {
		setErr('');
		setFormDisabled(true);
		setLoading(true);
		// TODO: validate: match discussion post and onchain post author match;
		try {
			const { data: resData, error } = await nextApiClientFetch<ILinkPostRemoveResponse>('api/v1/auth/actions/linkPostRemove', {
				currPostId,
				currPostType,
				postId,
				postType
			});
			if (error) {
				setErr(error);
			}
			if (resData) {
				setPostData((prev) => ({
					...prev,
					post_link: undefined,
					timeline: resData.timeline || []
				}));
				setData(undefined);
				queueNotification({
					header: 'Success',
					message: 'Successfully removed post linked.',
					status: NotificationStatus.SUCCESS
				});
			}
		} catch (error) {
			console.error((error && error?.message) || error);
		}
		setFormDisabled(false);
		setLoading(false);
		setShowModal(false);
	};

	useEffect(() => {
		const options = isOffChainProposalTypeValid(currPostType) ? onChainOptions : offChainOptions;
		setOptions(options);
		setPostType(options[0].value);
	}, [currPostType]);
	useEffect(() => {
		const footer: JSX.Element[] = [];
		if (postData.post_link) {
			footer.push(
				<CustomButton
					variant='default'
					icon={<DeleteOutlined />}
					htmlType='reset'
					key='reset'
					disabled={loading}
					onClick={handleRemove}
					className='mr-auto'
					text='Remove'
					buttonsize='xs'
				/>
			);
		} else if (data) {
			footer.push(
				<CustomButton
					variant='primary'
					icon={<CheckOutlined />}
					htmlType='submit'
					key='submit'
					disabled={loading}
					onClick={handleConfirm}
					className='bg-green_primary'
					text='Confirm'
					buttonsize='xs'
				/>
			);
		} else {
			footer.push(
				<CustomButton
					variant='primary'
					icon={<LinkOutlined />}
					htmlType='submit'
					key='submit'
					disabled={loading}
					onClick={handleSubmit}
					text='Link'
					buttonsize='xs'
				/>
			);
		}
		setFooter(<div className='flex items-center justify-end'>{footer}</div>);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, postId, postType, postData, loading]);

	useEffect(() => {
		const post_link = postData.post_link;
		if (post_link && (post_link.id !== postId || post_link.type !== postType)) {
			if (post_link.id) {
				setPostId(post_link.id);
			}
			if (post_link.type) {
				setPostType(post_link.type);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postData]);
	return (
		<>
			<CustomButton
				variant='primary'
				htmlType='button'
				className={className}
				onClick={() => {
					setShowModal(true);
					setErr('');
					const post_link = postData.post_link;
					if (post_link) {
						const { type, id } = post_link;
						setPostId(id);
						if (type) {
							setPostType(type);
						}
					}
				}}
			>
				<LinkOutlined /> Link Post
			</CustomButton>

			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				title={<h2 className='text-lg font-medium leading-7 text-sidebarBlue'>{data ? 'Confirm Details of Post ID to Link' : 'Post ID to Link'}</h2>}
				open={showModal}
				onOk={handleSubmit}
				confirmLoading={loading}
				onCancel={() => {
					setShowModal(false);
					setErr('');
					setData(undefined);
					setPostId(undefined);
				}}
				className={`${className} dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				footer={footer}
			>
				<Spin
					spinning={loading}
					indicator={<LoadingOutlined />}
				>
					<Form
						name='post-content-form'
						onFinish={handleSubmit}
						layout='vertical'
						disabled={formDisabled}
						className='my-5 flex flex-col gap-y-3'
					>
						<div className='flex flex-col gap-y-1'>
							<label
								htmlFor='postId'
								className='text-sm font-normal leading-5 text-sidebarBlue'
							>
								Enter post id
							</label>
							<Input
								className='disabled: rounded-md bg-white px-2.5 py-2 text-sm font-medium leading-6 dark:border-[#3B444F] dark:bg-section-dark-overlay dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								id='postId'
								disabled={!!data}
								value={postId}
								onChange={(e) => setPostId(Number(e.target.value))}
								autoFocus
								placeholder='Post ID'
								type='number'
							/>
						</div>
						<div className='flex flex-col gap-y-1'>
							<label
								htmlFor='postType'
								className='text-sm font-normal leading-5 text-sidebarBlue'
							>
								Enter post type
							</label>
							<Select
								id='postType'
								className='postTypeSelect w-full'
								disabled={!!data}
								value={postType}
								onChange={(e) => setPostType(e)}
								placeholder='Post Type'
								options={options}
							/>
						</div>
						{err ? (
							<div>
								<ErrorState
									isRefreshBtnVisible={false}
									errorMessage={err}
								/>
							</div>
						) : data ? (
							<div className='my-4'>
								<h3 className='text-xl font-medium text-sidebarBlue'>{data?.title || 'Untitled'}</h3>
								<div className='max-h-[350px] overflow-y-auto'>{data?.description ? <Markdown md={data?.description} /> : null}</div>
							</div>
						) : null}
					</Form>
				</Spin>
			</Modal>
		</>
	);
};

export default styled(LinkPostModal)`
	.postTypeSelect .ant-select-selector {
		font-weight: 500 !important;
		padding: 5px 10px !important;
		line-height: 1.5rem !important;
		font-size: 0.875rem !important;
		border-radius: 6px !important;
		height: auto !important;
	}
	.postTypeSelect .ant-select-selector {
		background-color: white !important;
	}
`;
