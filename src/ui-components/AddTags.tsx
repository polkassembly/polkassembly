// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InputRef, MenuProps, Tag ,Dropdown, Input } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { IPostTag } from '~src/types';
import { PlusOutlined } from '@ant-design/icons';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { poppins } from 'pages/_app';

interface Props{
  tags:string[];
  setTags:(pre:string[])=>void;
  className?:string;
}

const AddTags=({ tags,setTags,className }:Props) => {

	const [inputVisible, setInputVisible] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const inputRef = useRef<InputRef>(null);
	const [allTags,setAllTags]=useState<IPostTag[]>([]);

	const getData=async() => {
		const { data , error } = await nextApiClientFetch<IPostTag[]>('api/v1/all-tags');
		if(error) console.error('Error in getting all-tags', error);
		else if(data ){setAllTags(data);}
		console.log(data);
	};
	useEffect(() => {
		allTags.length === 0 && getData();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[]);

	useEffect(() => {
		if (inputVisible) {
			inputRef.current?.focus();
		}
	}, [inputVisible]);

	const handleClose = (removedTag: string) => {
		const newTags = tags.filter((tag) => tag !== removedTag);
		setTags(newTags);
	};

	const showInput = () => {
		setInputVisible(true);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};

	const handleInputConfirm = () => {
		if (inputValue && tags.indexOf( inputValue.toLowerCase() ) === -1 && inputValue.trim().length > 0){
			setTags([...tags, inputValue.trim().toLowerCase()]);
		}
		setInputVisible(false);
		setInputValue('');
	};
	const handleTagsSelected=(tagValue:string) => {
		if (tagValue && tags.indexOf( tagValue ) === -1 && tagValue.trim().length > 0){
			setTags([...tags, tagValue.trim()]);
		}
	};
	const items:MenuProps['items']=allTags?.slice(0,5).map((tag,index) => {
		return { key:index,label:<div className={`text-xs text-navBlue ${poppins.className} ${poppins.className} tracking-wide`} onClick={() => handleTagsSelected(tag?.name)}>{tag?.name.charAt(0).toUpperCase()+tag?.name.slice(1)}</div>
		};});

	return <div className={className}>
		<div className='border-solid border-gray-300 h-[40px] p-[10px] flex rounded border justify-between items-center text-navBlue'>
			<div>{tags.map((tag,index) => (
				<Tag
					key={index}
					className='text-navBlue rounded-xl bg-white text-normal text-xs py-[4px] px-[16px] tracking-wide hover:border-pink_primary'
					closable
					onClose={(e) => {e.preventDefault();handleClose(tag);}}>{tag.charAt(0).toUpperCase()+tag.slice(1)}</Tag>))}
			{inputVisible && tags.length < 5 && (
				<Input
					ref={inputRef}
					type="text"
					size="small"
					style={{ width: 78 }}
					value={inputValue}
					onChange={handleInputChange}
					onBlur={handleInputConfirm}
					onPressEnter={handleInputConfirm}
					className='text-navBlue rounded-xl bg-white text-xs text-normal px-[16px] py-[4px]'
				/> )}
			{tags.length < 5 && !inputVisible && <Dropdown
				overlayClassName='ml-[-10px] min-w-[104px] rounded create-post' menu={{ items }} placement="topLeft">
				<Tag onClick={showInput}className='rounded-xl bg-white border-pink_primary py-[4px] px-[16px] cursor-pointer text-pink_primary text-xs' >
					<PlusOutlined className='mr-1'/>
          Add new tag
				</Tag>
			</Dropdown>}
			</div>
			<div className={`text-xs  ${  5 - tags.length === 0 ? 'text-pink_primary':'text-navBlue' }`}>{5-(tags.length)} Tags left</div>
		</div></div>;
};
export default AddTags;
