// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Form, FormInstance, Input, Radio, Spin } from 'antd';
import AddTags from '~src/ui-components/AddTags';
import Markdown from '~src/ui-components/Markdown';
import { ISteps } from '.';
import { useNetworkContext } from '~src/context';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import { LoadingOutlined } from '@ant-design/icons';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import _ from 'lodash';
import styled from 'styled-components';
import TextEditor from '~src/ui-components/TextEditor';

interface Props{
  isDiscussionLinked: boolean | null;
  setIsDiscussionLinked: (pre: boolean) => void;
  discussionLink: string;
  setDiscussionLink: (pre: string) => void;
  title: string;
  content: string;
  tags: string[];
  setTitle: (pre: string) => void;
  setContent: (pre: string) => void;
  setTags: (pre: string[]) => void;
  setSteps: (pre: ISteps)=> void;
  form: FormInstance;
}

const WriteProposal = ({ setSteps, setIsDiscussionLinked, isDiscussionLinked, discussionLink, setDiscussionLink, title, setTitle, content, setContent, tags, setTags, form }: Props) => {
	const{ network } = useNetworkContext();
	const [loading, setLoading] = useState<boolean>(false);
	const [isDiscussionFound, setIsDiscussionFound] = useState<boolean>(true);

	const handleSubmit = async() => {
		await form.validateFields();
		setSteps({ percent: 0, step: 1 });
	};
	const isDiscussionLinkedValid = (value: string) => {
		const regex = /^https:\/\/\w+\.polkassembly\.io\/post\/\d+$/;
		return (!regex.test(value) || value.split('https://')[1].split('.')[0] !== network);
	};

	const getDiscussionPostData = async(link: string, isDiscussionLinked: boolean) => {
		const regex =  /^https:\/\/\w+\.polkassembly\.io\/post\/\d+$/;
		if(!regex.test(link)) return;

		const linkNetwork = link?.split('https://')[1]?.split('.')?.[0];
		const postId = link.split('post/')[1];
		if(network !== linkNetwork ) return;
		setLoading(true);
		const { data, error } = await nextApiClientFetch<IPostResponse>(`api/v1/posts/off-chain-post?postId=${postId}&network=${network}`);
		if(data){
			setTitle(data.title  || '');
			setContent(data.content || '');
			setTags(data?.tags || []);
			form.setFieldValue('title', (data?.title || ''));
			form.setFieldValue('content', (data?.content || ''));
			form.setFieldValue('tags', (data?.tags || []));
			setIsDiscussionFound(true);
			setSteps({ percent: 100, step: 0 });
			setLoading(false);
			onChangeLocalStorageSet({ content: data?.content || '', tags: data?.tags || [], title:data?.title || '' }, Boolean(isDiscussionLinked));
		}
		else if(error) {
			setIsDiscussionFound(false);
			queueNotification({
				header: 'Failed!',
				message: 'Unable to fetch data for this discussion number.' ,
				status: NotificationStatus.ERROR
			});
		}
		setLoading(false);

	};
	const handleStateChange = (writeProposalFormData: any) => {
		setSteps({ percent: 33.3, step: 0 });
		if(writeProposalFormData?.discussionLink){
			setSteps({ percent: 66.6, step:0 });
			!(writeProposalFormData?.content && writeProposalFormData.title) && getDiscussionPostData(writeProposalFormData?.discussionLink,writeProposalFormData?.isDiscussionLinked );
		}
		(writeProposalFormData?.discussionLink && writeProposalFormData.title && writeProposalFormData.content) && setSteps({ percent: 100, step: 0 });
		setDiscussionLink(writeProposalFormData?.discussionLink || '') ;
		setTitle(writeProposalFormData?.title || '');
		setContent(writeProposalFormData?.content || '');
		setTags(writeProposalFormData?.tags || []);
		form.setFieldValue('discussion_link', writeProposalFormData?.discussionLink || '');
		form.setFieldValue('title', writeProposalFormData?.title || '');
		form.setFieldValue('content', writeProposalFormData?.content || '');
		form.setFieldValue('tags', writeProposalFormData?.tags || []);
	};

	useEffect(() => {
		let data: any = localStorage.getItem('treasuryProposalData');
		data = JSON.parse(data);
		if(data && data?.writeProposalForm){
			const isDiscussionLink = data?.isDiscussionLinked;
			data?.isDiscussionLinked !== undefined && setIsDiscussionLinked(Boolean(isDiscussionLink));
			setSteps({ percent: 33.3, step: 0 });
			const writeProposalFormData = data?.writeProposalForm?.[isDiscussionLink ? 'discussionLinkForm' : 'withoutDiscussionLinkForm'] || {};
			handleStateChange(writeProposalFormData);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[]);

	const onChangeLocalStorageSet = (obj: any, isDiscussionLink: boolean, isDiscussionLinkedStateChange?: boolean) => {
		let data: any = localStorage.getItem('treasuryProposalData');
		if(data){data = JSON.parse(data);}

		const writeProposalFormKey = isDiscussionLink ? 'discussionLinkForm' : 'withoutDiscussionLinkForm';
		const writeProposalFormData = data?.writeProposalForm || {};
		const writeProposalKeysData = data?.writeProposalForm?.[writeProposalFormKey] || {};

		localStorage.setItem('treasuryProposalData', JSON.stringify({
			...data,
			isDiscussionLinked: isDiscussionLink,
			step: 0,
			writeProposalForm: {
				...writeProposalFormData,
				[writeProposalFormKey]: { ...writeProposalKeysData, ...obj }
			}
		}));
		isDiscussionLinkedStateChange && handleStateChange(writeProposalKeysData);
	};

	const handleChangeIsDiscussion = () => {
		setTitle('');
		setTags([]);
		setContent('');
		form.resetFields(['content', 'tags', 'title' ]);
		setIsDiscussionFound(true);
	};

	const handleIsDiscussionLinkedChange = (value: boolean) => {
		setIsDiscussionLinked(value);
		handleChangeIsDiscussion();
		onChangeLocalStorageSet({ isDiscussionLinked: value }, value, true);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const populateDiscussionPostDataFn = useCallback(_.debounce(getDiscussionPostData, 1500), []);
	const handleChangeDiscussionLink = (link: string, isDiscussionLinked: boolean) => {
		setDiscussionLink(link);
		handleChangeIsDiscussion();
		populateDiscussionPostDataFn(link, isDiscussionLinked);
		onChangeLocalStorageSet({ discussionLink: link }, Boolean(isDiscussionLinked));
		setSteps({ percent: 66.6, step: 0 });
	};

	return <>
		<Spin spinning={loading} indicator={<LoadingOutlined/>}>
			<div className='my-8 flex flex-col write-proposal'>
				<label className='text-lightBlue text-sm'>Have you initiated a discussion post for your proposal already? </label>
				<Radio.Group disabled={loading} onChange={(e) => handleIsDiscussionLinkedChange(e.target.value)} size='small' className='mt-1.5' value={isDiscussionLinked}>
					<Radio value={true} className='text-bodyBlue text-sm font-normal'>Yes</Radio>
					<Radio value={false} className='text-bodyBlue text-sm font-normal'>No</Radio>
				</Radio.Group>
			</div>
			<Form
				onFinish={handleSubmit}
				form={form}
				disabled={loading}
				initialValues={{ content, discussion_link: discussionLink, tags, title }}
				validateMessages= {
					{ required: "Please add the '${name}'" }
				}>
				{isDiscussionLinked && <>
					<label className='text-lightBlue text-sm mb-1.5'>Link Discussion Post</label>
					<Form.Item name='discussion_link' rules = {[{
						message: `Please add a valid discussion link for ${network} Network`,
						validator(rule, value, callback) {
							if (callback && isDiscussionLinkedValid(value)){
								callback(rule?.message?.toString());
							}else {
								callback();
							}
						}
					}]} >
						<Input name='discussion_link'
							value={discussionLink}
							onChange={(e) => handleChangeDiscussionLink(e.target.value, Boolean(isDiscussionLinked))}
							className='rounded-[4px] h-[40px]' placeholder='https://'/>
					</Form.Item>
				</>}
				{ isDiscussionLinked === false && <Alert type='info' className='icon-alert' showIcon message={
					<span className='text-sm font-medium text-bodyBlue'>
          Discussion posts allows the community to deliberate and recommend improvements. A Discussion should be created before creating a proposal.
						<a className='text-pink_primary text-xs ml-1' target='_blank' rel="noreferrer" href={'/post/create'}>
              Create Discussion Post
						</a>
					</span>}/>}

				{isDiscussionLinked !== null &&  (isDiscussionLinked ? (discussionLink && !isDiscussionLinkedValid(discussionLink) && isDiscussionFound) : true) && <div className='mt-6 text-sm font-normal text-lightBlue'>
					<label className='font-medium'>Write a proposal :</label>
					<div className='mt-4'>
						<label className='mb-0.5'>Title <span className='text-nay_red'>*</span></label>
						<Form.Item name='title'>
							<Input name='title' className='h-[40px] rounded-[4px]'
								onChange={(e) => {
									setTitle(e.target.value);
									onChangeLocalStorageSet({ title: e.target.value }, Boolean(isDiscussionLinked));
									setSteps({ percent: content.length === 0 ? 83.33 : 100, step: 0 });
								}}
								disabled={isDiscussionLinked}/>
						</Form.Item>
					</div>
					<div className='mt-6'>
						<label className='mb-0.5'>{isDiscussionLinked ?  'Tags' : 'Add Tags' }</label>
						<Form.Item name='tags'>
							<AddTags onChange={(e) => onChangeLocalStorageSet({ tags: e }, isDiscussionLinked)} tags={tags} setTags={setTags} disabled={isDiscussionLinked}/>
						</Form.Item>
					</div>
					<div className='mt-6'>
						<label className='mb-0.5'>Description <span className='text-nay_red'>*</span></label>
						{isDiscussionLinked ? <Markdown imgHidden className='post-content border-solid bg-[#f5f5f5] border-[#dddddd] border-[1px] py-2 px-3 rounded-[4px] ' md={`${content?.slice(0, 300)}...` || content} /> : <Form.Item name='content'>
							<TextEditor
								name='content'
								value={content}
								height={250}
								onChange={(content: string) => {
									setContent(content);
									onChangeLocalStorageSet({ content: content }, isDiscussionLinked);
									setSteps({ percent:title.length === 0 ? 83.33 : 100, step: 0 });
								}}  />
						</Form.Item>}
					</div>
				</div>}
				<div className='flex justify-end mt-6 -mx-6 border-0 border-solid border-t-[1px] border-[#D2D8E0] px-6 pt-4'>
					<Button htmlType='submit' className={`bg-pink_primary text-white font-medium tracking-[0.05em] text-sm h-[40px] rounded-[4px] w-[155px] ${(!isDiscussionLinked ? !(title && content) : !(discussionLink && title && content)) && 'opacity-50' }`} disabled={!isDiscussionLinked ? !(title && content ) : !(discussionLink && title && content)}>Next</Button>
				</div>
			</Form>
		</Spin>
	</>;
};
export default styled(WriteProposal)`
.icon-alert .ant-alert-icon{
  margin-top: -40px !important;
}`;