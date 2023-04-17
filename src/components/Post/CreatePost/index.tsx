// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Form, Input, InputNumber, Modal, Radio, Spin, Switch } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import ContentForm from 'src/components/ContentForm';
import { UserDetailsContext } from 'src/context/UserDetailsContext';
import { PostCategory } from 'src/global/post_categories';
import { usePollEndBlock } from 'src/hooks';
import { NotificationStatus } from 'src/types';
import BackToListingView from 'src/ui-components/BackToListingView';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';

import { ChangeResponseType, CreatePostResponseType } from '~src/auth/types';
import POLL_TYPE from '~src/global/pollTypes';
import { ProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import TopicsRadio from './TopicsRadio';
import AddTags from '~src/ui-components/AddTags';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { useApiContext, useNetworkContext } from '~src/context';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import getAllAccounts, { initResponse } from '~src/util/getAllAccounts';
import Address from '~src/ui-components/Address';
import { Signer } from '@polkadot/api/types';

interface Props {
	className?: string;
	proposalType: ProposalType;
}

const CreatePost = ({ className, proposalType } : Props) => {
	const router = useRouter();
	const currentUser = useContext(UserDetailsContext);
	const { network } = useNetworkContext();
	const pollEndBlock = usePollEndBlock();
	const { api, apiReady } = useApiContext();

	const [form] = Form.useForm();

	const [accountsInfo, setAccountsInfo] = useState(initResponse);
	const { accounts, accountsMap, signersMap } = accountsInfo;

	const [topicId, setTopicId] = useState<number>(1);
	const [hasPoll, setHasPoll] = useState<boolean>(false);
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [govType,setGovType]=useState<'gov_1' | 'open_gov'>('gov_1');
	const [tags,setTags]=useState<string[]>([]);
	const [startBlock, setStartBlock] = useState<number>();
	const [endBlock, setEndBlock] = useState<number>();
	const [optionsArray, setOptionsArray] = useState(['']);
	const [address, setAddress] = useState<string>();
	const [showAddressModal, setShowAddressModal] = useState(false);

	useEffect(() => {
		if (!currentUser?.id) {
			router.replace('/');
		}
	}, [currentUser?.id, router]);

	const onOptionChange = (event: any, i: number) => {
		setOptionsArray((prevState) => {
			const copyArray = [...prevState];
			copyArray[i] = event.target.value;
			return copyArray;
		});
	};

	const onAddOption = () => {
		setOptionsArray((prevState) => {
			const copyOptionsArray = [...prevState];
			copyOptionsArray.push('');
			return copyOptionsArray;
		});
	};

	const onRemoveOption = (i: number) => {
		const copyOptionsArray = [...optionsArray];
		copyOptionsArray.splice(i, 1);
		setOptionsArray(copyOptionsArray);
	};

	const createSubscription = async (postId: number) => {
		if (!currentUser.email_verified) return;

		const { data , error } = await nextApiClientFetch<ChangeResponseType>( 'api/v1/auth/actions/postSubscribe', { post_id: postId, proposalType });
		if(error) console.error('Error subscribing to post', error);
		if(data?.message) console.log(data.message);
	};

	const createPoll = async (postId: number) => {
		if (proposalType !== ProposalType.REMARK_PROPOSALS && !hasPoll) return;
		if(proposalType === ProposalType.REMARK_PROPOSALS && !optionsArray?.length) return;

		if (!pollEndBlock && !endBlock) {
			queueNotification({
				header: 'Failed to get end block number. Poll creation failed!',
				message: 'Failed',
				status: NotificationStatus.ERROR
			});
			return;
		}

		const options = [...(new Set(optionsArray))].filter(x => x);

		// { endAt, options: optionsString, question, blockEnd, blockStart, postId, proposalType, pollType }

		const pollPayload = {
			blockEnd: endBlock || pollEndBlock,
			blockStart: startBlock,
			options: JSON.stringify(options),
			pollType: proposalType === ProposalType.REMARK_PROPOSALS ? POLL_TYPE.REMARK : POLL_TYPE.NORMAL,
			postId,
			proposalType
		};

		const { error: apiError } = await nextApiClientFetch( 'api/v1/auth/actions/createPoll', pollPayload);

		if(apiError) {
			console.error('Error creating a poll', apiError);
			return;
		}
	};

	const handleSelectAddress = () => {
		setLoading(true);

		getAllAccounts({
			api,
			apiReady,
			get_erc20: ['moonbase', 'moonriver', 'moonbeam'].includes(network),
			network
		})
			.then((res) => {
				setAccountsInfo(res);
			})
			.catch((err) => {
				console.error(err);
			});

		setShowAddressModal(true);
		setLoading(false);
	};

	async function _createPost(content: string, title: string, remarkPayload?:any) {
		setFormDisabled(true);
		setLoading(true);

		const createPostPayload: any = {
			content,
			gov_type:govType,
			proposalType,
			tags,
			title,
			topicId,
			userId: currentUser.id
		};

		if(remarkPayload && remarkPayload.address && remarkPayload.start && remarkPayload.end && remarkPayload.address) {
			createPostPayload.start_block_num = Number(remarkPayload.start);
			createPostPayload.end_block_num = Number(remarkPayload.end);
			createPostPayload.proposer_address = String(remarkPayload.address);
		}

		const { data, error: apiError } = await nextApiClientFetch<CreatePostResponseType>( 'api/v1/auth/actions/createPost', createPostPayload);

		if(apiError || !data?.post_id) {
			setError(apiError || 'There was an error creating your post.');
			queueNotification({
				header: 'Error',
				message: 'There was an error creating your post.',
				status: NotificationStatus.ERROR
			});
			console.error(apiError);
		}

		if(data && data.post_id) {
			const postId = data.post_id;
			router.push(`/${proposalType === ProposalType.GRANTS ? 'grant' : proposalType === ProposalType.REMARK_PROPOSALS ? 'remark-proposal' : 'post'}/${postId}`);

			queueNotification({
				header: 'Thanks for sharing!',
				message: 'Post created successfully.',
				status: NotificationStatus.SUCCESS
			});
			createSubscription(postId);
			createPoll(postId);
		}

		setFormDisabled(false);
		setLoading(false);
	}

	const handleSend = async () => {
		if(!currentUser.id) return;

		try {
			await form.validateFields();
			// Validation is successful
			const content = form.getFieldValue('content');
			const title = form.getFieldValue('title');

			if(!title || !content) return;
			if(proposalType === ProposalType.REMARK_PROPOSALS) {
				if(!api || !apiReady || !startBlock || !endBlock || !address) return;

				const signer: Signer = signersMap[accountsMap[address]];
				api.setSigner(signer);

				setFormDisabled(true);
				setLoading(true);

				const remarkPayload = {
					address,
					content,
					end: endBlock,
					id: currentUser.id,
					start: startBlock,
					title
				};

				const payload = JSON.stringify(remarkPayload);

				await api.tx.system.remarkWithEvent(`${network.charAt(0).toUpperCase() + network.slice(1)}::Proposal::${payload}`).signAndSend(address, async ({ status }) => {
					setFormDisabled(true);
					setLoading(true);

					if(status.isInBlock){
						await _createPost(content, title, remarkPayload);
					}
				}).catch((error) => {
					queueNotification({
						header: 'Error in post creation',
						message: error.message,
						status: NotificationStatus.ERROR
					});
				});

				return;
			}

			await _createPost(content, title);
		} catch {
		//do nothing, await form.validateFields(); will automatically highlight the error ridden fields
		} finally {
			setFormDisabled(false);
			setLoading(false);
		}
	};

	return (
		<div className={className}>
			<BackToListingView postCategory={
				proposalType === ProposalType.DISCUSSIONS ? PostCategory.DISCUSSION :
					proposalType === ProposalType.REMARK_PROPOSALS ? PostCategory.REMARK_PROPOSAL : PostCategory.GRANT
			}/>

			<div className="flex flex-col mt-6 bg-white p-4 md:p-8 rounded-md w-full shadow-md mb-4">
				<h2 className="dashboard-heading mb-8">New Post</h2>
				{error && <ErrorAlert errorMsg={error} className='mb-4' />}

				<Form
					form={form}
					name="create-post-form"
					onFinish={handleSend}
					layout="vertical"
					disabled={formDisabled || loading}
					validateMessages= {
						{ required: "Please add the '${name}'" }
					}
				>
					<Form.Item name="title" label='Title' rules={[{ required: true }]}>
						<Input name='title' autoFocus placeholder='Enter Title' className='text-black' />
					</Form.Item>

					<ContentForm />

					{ proposalType !== ProposalType.REMARK_PROPOSALS && <div className="flex items-center">
						<Switch size="small" onChange={checked => setHasPoll(checked)} />
						<span className='ml-2 text-sidebarBlue text-sm'>Add poll to {proposalType === ProposalType.DISCUSSIONS ? 'discussion': 'grant'}</span>
					</div>}

					{ proposalType !== ProposalType.REMARK_PROPOSALS && isOpenGovSupported(network) && <>
						<h5 className='text-sm text-color mt-8 font-normal'>Select Governance version <span className='text-red-500'>*</span></h5><Radio.Group className='font-normal text-xs p-1' onChange={(e) => { setTopicId(1); setGovType(e.target.value); } } value={govType}>
							<Radio className={`font-normal text-xs text-navBlue ${govType === 'gov_1' && 'text-pink_primary'}`} value='gov_1' defaultChecked>Governance V1</Radio>
							<Radio className={`font-normal text-xs text-navBlue ${govType === 'open_gov' && 'text-pink_primary'}`} value='open_gov' defaultChecked={false}>Governance V2</Radio>
						</Radio.Group>
					</>}

					{
						proposalType === ProposalType.DISCUSSIONS ?
							<div className='mt-8'>
								<h5 className="text-color tracking-wide text-sm mb-3 font-normal">
									Select Topic<span className='text-red-500 ml-1'>*</span>
								</h5>
								<TopicsRadio govType={govType} onTopicSelection={(id) => setTopicId(id)} />
							</div>
							: null
					}

					<h5 className='text-sm text-color mt-8 font-normal'>Add Tags</h5>
					<AddTags tags={tags} setTags={setTags} />

					{ proposalType === ProposalType.REMARK_PROPOSALS && <>
						<div className='mt-8 flex items-center justify-between max-w-[576px]'>
							<div className='w-full'>
								<h5 className='text-sm text-color font-normal'>Start Block Number</h5>
								<InputNumber disabled={loading} className='w-5/6' min={1} placeholder='123456' value={startBlock} onChange={(num) => setStartBlock(Number(num))} />
							</div>
							<div className='w-full'>
								<h5 className='text-sm text-color font-normal'>End Block Number</h5>
								<InputNumber disabled={loading} className='w-5/6' min={1} placeholder='123456' value={endBlock} onChange={(num) => setEndBlock(Number(num))} />
							</div>
						</div>

						<Form.Item className='mt-8' label='Add Options'>
							{optionsArray.map((option, i) => {
								return (
									<>
										<div className='flex items-center gap-x-4 mb-4'>
											<Input
												disabled={loading}
												onChange={(e) => onOptionChange(e, i)}
												type='text'
												value={option}
											/>
											{i !== 0 && <Button disabled={loading} onClick={() => onRemoveOption(i)}>-</Button>}

										</div>
									</>
								);
							})}
							<div className='flex w-full justify-end'>
								<Button disabled={loading} className='bg-pink_primary text-white border-white hover:bg-pink_secondary flex items-center justify-center rounded-md ' onClick={onAddOption}>+</Button>
							</div>
						</Form.Item>

						<div className="flex items-center justify-start gap-x-6">
							<Button
								loading={loading}
								className='bg-white mb-8 text-base text-pink_primary border-pink_primary hover:border-pink_secondary rounded-md flex items-center justify-start p-3'
								onClick={() => handleSelectAddress()}
							>
								Select Address
							</Button>

							{ address && <Address className=' -mt-8' address={address} />}
						</div>

						<Modal
							title="Select Address"
							open={showAddressModal}
							onCancel={() => setShowAddressModal(false)}
							onOk={() => setShowAddressModal(false)}
						>
							<Spin spinning={loading} indicator={<LoadingOutlined />}>
								<AccountSelectionForm
									title='Post with account'
									accounts={accounts}
									address={address || ''}
									withBalance
									onAccountChange={(addr) => setAddress(addr)}
								/>
							</Spin>
						</Modal>
					</>
					}

					<Form.Item>
						<Button htmlType="submit" loading={loading} disabled={!currentUser.id || formDisabled || loading} className='mt-10 bg-pink_primary text-white border-white hover:bg-pink_secondary flex items-center justify-center rounded-md text-lg h-[50px] w-[215px]'>
							Create Post
						</Button>
					</Form.Item>
				</Form>
			</div>
		</div>
	);
};

export default styled(CreatePost)`
.text-color{
  color:#334D6EE5;
}

`;