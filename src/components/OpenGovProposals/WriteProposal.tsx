// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, FormInstance, Input, Radio, Spin } from 'antd';
import AddTags from '~src/ui-components/AddTags';
import MarkdownEditor from '~src/ui-components/MarkdownEditor';
import { ISteps } from '.';
import { useNetworkContext } from '~src/context';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import { LoadingOutlined } from '@ant-design/icons';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';

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

	const handleStateChange = (writeProposalFormData: any) => {
		writeProposalFormData?.discussionLink && setSteps({ percent: 66.6, step:0 });
		writeProposalFormData.title && setSteps({ percent: 83.33, step: 0 });
		writeProposalFormData.content && setSteps({ percent: 100, step: 0 });

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
			setIsDiscussionLinked(isDiscussionLink);
			setSteps({ percent: 33.3, step: 0 });
			const writeProposalFormData = data?.writeProposalForm?.[isDiscussionLink ? 'discussionLinkForm' : 'withoutDiscussionLinkForm'] || {};
			handleStateChange(writeProposalFormData);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[]);

	const onChangeLocalSet = (obj: any, isDiscussionLink: boolean, isDiscussionLinkedStateChange?: boolean) => {
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

	const getDiscussionPostData = async(link: string) => {
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
			onChangeLocalSet({ content: data?.content || '', tags: data?.tags || [], title:data?.title || '' }, Boolean(isDiscussionLinked));
			setSteps({ percent: 100, step: 0 });
			setLoading(false);
		}
		else if(error) {
			setIsDiscussionFound(false);
			queueNotification({
				header: 'Failed!',
				message: error || 'Invalid discussion link. ' ,
				status: NotificationStatus.ERROR
			});
		}
		setLoading(false);

	};

	const handleChangeIsDiscussion = () => {
		setTitle('');
		setTags([]);
		setContent('');
		form.setFieldValue('title', '');
		form.setFieldValue('content', '');
		form.setFieldValue('tags', []);
		setIsDiscussionFound(true);
	};

	return <>
		<Spin spinning={loading} indicator={<LoadingOutlined/>}>
			<div className='my-8 flex flex-col'>
				<label className='text-lightBlue text-sm'>Have you initiated a discussion post for your proposal already? </label>
				<Radio.Group disabled={loading} onChange={(e) => {setIsDiscussionLinked(e.target.value); handleChangeIsDiscussion(); onChangeLocalSet({ isDiscussionLinked: e.target.value }, e.target.value, true); setSteps({ percent: 33.3, step: 0 });}} size='small' className='mt-1.5' value={isDiscussionLinked}>
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
						message: 'Invalid Discussion link',
						validator(rule, value, callback) {
							if (callback && isDiscussionLinkedValid(value)){
								callback(rule?.message?.toString());
							}else {
								callback();
							}
						}
					}]} >
						<Input name='discussion_link' value={discussionLink} onChange={(e) => {setDiscussionLink(e.target.value); handleChangeIsDiscussion(); onChangeLocalSet({ discussionLink: e.target.value }, isDiscussionLinked); getDiscussionPostData(e.target.value); setSteps({ percent: 66.6, step: 0 });}} className='rounded-[4px] h-[40px]' placeholder='🌐 https://'/>
					</Form.Item>
				</>}
				{ isDiscussionLinked === false && <Alert type='info' showIcon message={
					<span className='text-sm font-medium text-bodyBlue'>
          Discussion posts allows the community to deliberate and recommend improvements. A Discussion should be created before creating a proposal.
						<a className='text-pink_primary text-xs' target='_blank' rel="noreferrer" href={'/post/create'}>
							{' '} Create Discussion Post
						</a>
					</span>}/>}

				{isDiscussionLinked !== null &&  (isDiscussionLinked ? (discussionLink && !isDiscussionLinkedValid(discussionLink) && isDiscussionFound) : true) && <div className='mt-6 text-sm font-normal text-lightBlue'>
					<label className='font-medium'>Write a proposal :</label>
					<div className='mt-4'>
						<label className='mb-0.5'>Title <span className='text-nay_red'>*</span></label>
						<Form.Item name='title' rules={[{ required: true }]}>
							<Input name='title' className='h-[40px] rounded-[4px]' onChange={(e) => {setTitle(e.target.value); onChangeLocalSet({ title: e.target.value }, isDiscussionLinked); setSteps({ percent: 83.33, step: 0 });}} disabled={isDiscussionLinked}/>
						</Form.Item>
					</div>
					<div className='mt-6'>
						<label className='mb-0.5'>Add Tags</label>
						<Form.Item name='tags'>
							<AddTags onChange={(e) => onChangeLocalSet({ tags: e }, isDiscussionLinked)} tags={tags} setTags={setTags} disabled={isDiscussionLinked}/>
						</Form.Item>
					</div>
					<div className='mt-6'>
						<label className='mb-0.5' >Description <span className='text-nay_red'>*</span></label>
						<Form.Item name='content' rules={[{ required: true }]}>
							<MarkdownEditor disabled={isDiscussionLinked} name='content' value={content}  onChange={(content: string) => {setContent(content); onChangeLocalSet({ content: content }, isDiscussionLinked); setSteps({ percent: 100, step: 0 });}} />
						</Form.Item>
					</div>
				</div>}
				<div className='flex justify-end mt-6 -mx-6 border-0 border-solid border-t-[1px] border-[#D2D8E0] px-6 pt-4'>
					<Button htmlType='submit' className={`bg-pink_primary text-white font-medium tracking-[0.05em] text-sm h-[40px] rounded-[4px] w-[155px] ${(!isDiscussionLinked ? !(title && content) : !(discussionLink && title && content)) && 'opacity-50' }`} disabled={!isDiscussionLinked ? !(title && content ) : !(discussionLink && title && content)}>Next</Button>
				</div>
			</Form>
		</Spin>
	</>;
};
export default WriteProposal;