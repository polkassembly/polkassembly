// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InputRef, MenuProps, Tag, Dropdown, Input } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { IPostTag } from '~src/types';
import { PlusOutlined } from '@ant-design/icons';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { poppins } from 'pages/_app';
import handleFilterResults from '~src/util/handleFilterResults';
import NoTagsFoundIcon from '~assets/icons/no-tag.svg';

interface Props {
	tags: string[];
	setTags: (pre: string[]) => void;
	className?: string;
}

const AddTags = ({ tags, setTags, className }: Props) => {
	const [inputVisible, setInputVisible] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const inputRef = useRef<InputRef>(null);
	const [allTags, setAllTags] = useState<IPostTag[]>([]);
	const [filteredTags, setFilteredTags] = useState<IPostTag[]>([]);
	const selectedTag = useRef<string | null>(null);
	const [charLimitReached, setCharLimitReached] = useState<boolean>(false);

	const getData = async () => {
		const { data, error } = await nextApiClientFetch<IPostTag[]>(
			'api/v1/all-tags',
		);
		if (error) console.error('Error in getting all-tags', error);
		else if (data) {
			setAllTags(data);
			setFilteredTags(data);
		}
	};

	useEffect(() => {
		inputValue.length >= 20
			? setCharLimitReached(true)
			: setCharLimitReached(false);

		allTags.length === 0 && getData();

		handleFilterResults(allTags, setFilteredTags, tags, inputValue);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [inputValue, tags]);

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
		selectedTag.current = null;
		const value = e.target.value;
		if (value.length > 20) {
			return;
		}
		setInputValue(e.target.value);
	};

	const handleInputConfirm = () => {
		if (selectedTag.current !== null) {
			if (
				tags.length < 5 &&
				selectedTag.current &&
				tags.indexOf(selectedTag.current.toLowerCase()) === -1 &&
				selectedTag.current !== null
			) {
				setTags([...tags, selectedTag.current.trim()]);
			}
		} else {
			if (
				inputValue &&
				tags.length < 5 &&
				tags.indexOf(inputValue.toLowerCase()) === -1 &&
				inputValue.trim().length > 0
			) {
				const format = /^[a-zA-Z0-9]*$/;
				if (inputValue.length === 20) {
					setCharLimitReached(true);
				}
				if (inputValue.length > 20 || !format.test(inputValue)) {
					setInputValue('');
					return;
				} else {
					setTags([...tags, inputValue.trim().toLowerCase()]);
				}
			}
		}
		selectedTag.current = null;
		setInputValue('');
		setInputVisible(false);
	};

	const items: MenuProps['items'] = [
		filteredTags.length === 0
			? {
					key: 1,
					label: (
						<div className="h-[100%] flex items-center justify-center flex-col gap-2">
							<NoTagsFoundIcon />
							<span
								className={`text-[10px] text-[#90A0B7] tracking-wide ${poppins.className} ${poppins.variable} `}
							>
								No tag found.
							</span>
						</div>
					),
			  }
			: null,
		...filteredTags.slice(0, 5).map((tag, index) => {
			return {
				key: index + 2,
				label: (
					<div
						className={`text-xs text-[#90A0B7]  ${poppins.className} ${poppins.className} tracking-wide`}
						onClick={() => {
							selectedTag.current = tag?.name;
							handleInputConfirm();
						}}
					>
						{tag?.name}
					</div>
				),
			};
		}),
	];

	return (
		<div className={className}>
			<div className="border-solid border-gray-300 h-[40px] p-[10px] flex rounded border justify-between items-center text-[#90A0B7]  max-lg:h-auto">
				<Dropdown
					disabled={tags.length === 5}
					overlayClassName="ml-[-10px] min-w-[104px] rounded create-post"
					menu={{ items }}
					placement="topLeft"
				>
					<div className="flex ">
						{inputVisible
							? tags.length < 5 && (
									<Input
										ref={inputRef}
										type="text"
										size="small"
										style={{ width: 78 }}
										value={inputValue}
										onChange={handleInputChange}
										onPressEnter={handleInputConfirm}
										className={`text-[#90A0B7]  rounded-xl bg-white text-xs text-normal px-[16px] py-[4px] mr-2 flex items-center ${
											charLimitReached && 'border-red-500'
										}`}
									/>
							  )
							: tags.length < 5 && (
									<Tag
										onClick={showInput}
										className="rounded-xl bg-white border-pink_primary py-[4px] px-[16px] cursor-pointer text-pink_primary text-xs flex items-center"
									>
										<PlusOutlined className="mr-1" />
										Add new tag
									</Tag>
							  )}
						<div className="max-sm:flex max-sm:flex-col max-sm:gap-1 max-sm:mt-1">
							{tags.map((tag, index) => (
								<Tag
									key={index}
									className="text-[#90A0B7] border-[#90A0B7] rounded-xl bg-white text-normal text-xs py-[4px] px-[16px] tracking-wide hover:border-pink_primary"
									closable
									onClose={(e) => {
										e.preventDefault();
										handleClose(tag);
									}}
								>
									{tag}
								</Tag>
							))}
						</div>
					</div>
				</Dropdown>
				<div
					className={`text-xs  ${
						5 - tags.length === 0
							? 'text-pink_primary'
							: 'text-[#90A0B7] '
					}`}
				>
					{5 - tags.length} Tags left
				</div>
			</div>
			{charLimitReached && (
				<h2 className="text-red-500 font-medium text-xs tracking-wide mt-1">
					Character limit reached
				</h2>
			)}
		</div>
	);
};
export default AddTags;
