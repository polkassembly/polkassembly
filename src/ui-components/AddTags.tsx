// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InputRef, MenuProps, Tag, Input } from 'antd';
import { Dropdown } from '~src/ui-components/Dropdown';
import React, { useEffect, useRef, useState } from 'react';
import { IPostTag } from '~src/types';
import { PlusOutlined } from '@ant-design/icons';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { poppins } from 'pages/_app';
import handleFilterResults from '~src/util/handleFilterResults';
import NoTagsFoundIcon from '~assets/icons/no-tag.svg';
import { useTheme } from 'next-themes';

interface Props {
	tags: string[];
	setTags: (pre: string[]) => void;
	className?: string;
	disabled?: boolean;
	onChange?: (pre: any) => void;
}

const AddTags = ({ tags, setTags, className, disabled, onChange }: Props) => {
	const [inputVisible, setInputVisible] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const inputRef = useRef<InputRef>(null);
	const [allTags, setAllTags] = useState<IPostTag[]>([]);
	const [filteredTags, setFilteredTags] = useState<IPostTag[]>([]);
	const selectedTag = useRef<string | null>(null);
	const [charLimitReached, setCharLimitReached] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();
	const getData = async () => {
		const { data, error } = await nextApiClientFetch<IPostTag[]>('api/v1/all-tags');
		if (error) console.error('Error in getting all-tags', error);
		else if (data) {
			setAllTags(data);
			setFilteredTags(data);
		}
	};

	useEffect(() => {
		inputValue.length >= 20 ? setCharLimitReached(true) : setCharLimitReached(false);

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
		onChange && onChange(newTags);
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
			if (tags.length < 5 && selectedTag.current && tags.indexOf(selectedTag.current.toLowerCase()) === -1 && selectedTag.current !== null) {
				setTags([...tags, selectedTag.current.trim()]);
				onChange && onChange([...tags, selectedTag.current.trim()]);
			}
		} else {
			if (inputValue && tags.length < 5 && tags.indexOf(inputValue.toLowerCase()) === -1 && inputValue.trim().length > 0) {
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
				onChange && onChange([...tags, inputValue.trim().toLowerCase()]);
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
						<div className='flex h-[100%] flex-col items-center justify-center gap-2'>
							<NoTagsFoundIcon />
							<span className={`text-[10px] tracking-wide text-[#90A0B7] ${poppins.className} ${poppins.variable} `}>No tag found.</span>
						</div>
					)
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
				)
			};
		})
	];

	return (
		<div className={className}>
			<div
				className={`flex min-h-[40px] items-center justify-between rounded border border-solid border-gray-300 p-[10px] text-[#90A0B7] max-lg:h-auto ${
					disabled && 'cursor-not-allowed bg-[#F5F5F5]'
				}`}
			>
				<Dropdown
					theme={theme}
					disabled={tags.length === 5 || disabled}
					overlayClassName='ml-[-10px] min-w-[104px] rounded create-post z-[1056]'
					menu={{ items }}
					placement='topLeft'
				>
					<div className={'flex'}>
						{inputVisible && !disabled
							? tags.length < 5 && (
									<Input
										disabled={disabled}
										name='tags'
										ref={inputRef}
										type='text'
										size='small'
										style={{ width: 78 }}
										value={inputValue}
										onChange={handleInputChange}
										onPressEnter={handleInputConfirm}
										className={`text-normal  mr-2 flex items-center rounded-xl bg-white px-[16px] py-[4px] text-xs text-[#90A0B7] dark:bg-section-dark-overlay ${
											charLimitReached && 'border-red-500'
										} dark:border-[#3B444F] dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]`}
									/>
							  )
							: tags.length < 5 &&
							  !disabled && (
									<Tag
										onClick={showInput}
										className='flex cursor-pointer items-center rounded-xl border-pink_primary bg-white px-[16px] py-[4px] text-xs text-pink_primary dark:bg-section-dark-overlay'
									>
										<PlusOutlined className='mr-1' />
										Add new tag
									</Tag>
							  )}
						<div className='max-sm:mt-1 max-sm:flex max-sm:flex-col max-sm:gap-1'>
							{tags.map((tag, index) => (
								<Tag
									key={index}
									className={`text-normal mt-1 rounded-xl border-[#90A0B7] bg-white px-[16px] py-[4px] text-xs tracking-wide text-[#90A0B7] dark:bg-section-dark-overlay ${
										disabled ? 'bg-[#F5F5F5]' : 'hover:border-pink_primary'
									}`}
									closable={!disabled}
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
				{!disabled && <div className={`text-xs ${5 - tags.length === 0 ? 'text-pink_primary' : 'text-[#90A0B7]'}`}>{5 - tags.length} Tags left</div>}
			</div>
			{charLimitReached && <h2 className='mt-1 text-xs font-medium tracking-wide text-red-500'>Character limit reached</h2>}
		</div>
	);
};
export default AddTags;
