// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InputRef, MenuProps, Tag, Input, Dropdown } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { IPostTag } from '~src/types';
import { PlusOutlined } from '@ant-design/icons';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { poppins } from 'pages/_app';
import handleFilterResults from '~src/util/handleFilterResults';
import { useTheme } from 'next-themes';
import { NoTagFoundIcon } from './CustomIcons';
import styled from 'styled-components';

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
						<div className='flex flex-col items-center justify-center gap-1 py-2'>
							<span className='text-3xl'>
								<NoTagFoundIcon />
							</span>
							<span className={`text-[10px] tracking-wide text-[#90A0B7] ${poppins.className} ${poppins.variable} `}>No tag found.</span>
							<span className={`text-[10px] tracking-wide text-[#90A0B7] ${poppins.className} ${poppins.variable} `}>Press enter to add new tag.</span>
						</div>
					)
			  }
			: null,
		...filteredTags.slice(0, 5).map((tag, index) => {
			return {
				key: index + 2,
				label: (
					<div
						className={`text-xs text-[#90A0B7]  ${poppins.className} ${poppins.className} tracking-wide dark:text-blue-dark-high`}
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
				className={`flex min-h-[40px] items-center justify-between rounded border border-solid border-gray-300 p-[10px] text-[#90A0B7] dark:border-[#3B444F] dark:border-separatorDark max-lg:h-auto ${
					disabled && 'cursor-not-allowed bg-[#F5F5F5] dark:bg-section-dark-overlay'
				}`}
			>
				<Dropdown
					disabled={tags.length === 5 || disabled}
					overlayClassName={`dark:bg-section-dark-overlay overlay-class dark:border-separatorDark dark:rounded-lg dark:text-white [&>ul]:w-[126px] ${
						theme == 'dark'
							? '[&>ul]:bg-section-dark-garyBackground [&>ul>li]:text-white [&>ul>.ant-dropdown-menu-item-selected]:bg-section-dark-garyBackground [&>ul>.ant-dropdown-menu-item-selected]:text-pink_primary hover:[&>ul>li]:bg-section-dark-garyBackground hover:[&>ul>li]:text-pink_secondary'
							: ''
					} z-[2000] `}
					menu={{ items }}
					placement='topLeft'
					trigger={['click']}
				>
					<div className='flex w-full flex-wrap gap-1'>
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
											} dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-blue-dark-high dark:focus:border-[#91054F] [&>input]:dark:bg-section-dark-overlay [&>input]:dark:text-blue-dark-high`}
											suffix={
												<span
													className='cursor-pointer'
													onClick={handleInputConfirm}
												>
													<PlusOutlined />
												</span>
											}
										/>
								  )
								: tags.length < 5 &&
								  !disabled && (
										<Tag
											onClick={showInput}
											className='flex cursor-pointer items-center rounded-xl border-pink_primary bg-white px-4 py-1 text-xs text-pink_primary dark:bg-section-dark-overlay'
										>
											<PlusOutlined className='mr-1' />
											Add new tag
										</Tag>
								  )}
						</div>
						{tags.map((tag, index) => (
							<Tag
								key={index}
								className={`text-normal mt-1 rounded-xl border-[#90A0B7] bg-white px-[16px] py-[4px] text-xs tracking-wide text-[#90A0B7] dark:bg-section-dark-overlay ${
									disabled ? 'bg-[#F5F5F5] dark:bg-disableStateDark dark:text-blue-dark-high' : 'hover:border-pink_primary'
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
				</Dropdown>
				{!disabled && <div className={`w-[80px] text-xs ${5 - tags.length === 0 ? 'text-pink_primary' : 'text-[#90A0B7]'}`}>{5 - tags.length} Tags left</div>}
			</div>
			{charLimitReached && <h2 className='mt-1 text-xs font-medium tracking-wide text-red-500'>Character limit reached</h2>}
		</div>
	);
};
export default styled(AddTags)`
	.overlay-class {
		width: 126px !important;
		min-width: 0px !important;
	}
`;
