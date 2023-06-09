// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Checkbox, Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import Tips from '~assets/icons/tips.svg';
import Toggler from './Toggler';
type Props = {
    categoryOptions: any;
    title?: string;
    classname?: string;
    Icon?: any;
    onChange: any;
	handleCategoryAllClick?:any
};

export default function GroupCheckbox({
	categoryOptions,
	title,
	classname,
	Icon,
	onChange,
	handleCategoryAllClick
}: Props) {
	const [all, setAll] = useState(false);

	const handleAllClick = (checked: boolean) => {
		handleCategoryAllClick(checked, categoryOptions, title);
		setAll(checked);
	};

	useEffect(() => {
		setAll(categoryOptions.every((category: any) => category.selected));
	}, [categoryOptions]);

	const handleChange = (e: any, value: any) => {
		setAll(false);
		onChange(categoryOptions, e.target.checked, value, title || '');
	};

	return (
		<div className={classname}>
			{!!title && (
				<div className='flex items-center gap-[4px] mb-[16px]'>
					{title && Icon ? (
						<Icon />
					) : (
						<Tips className='w-[20px] h-[20px]' />
					)}

					<h3 className='font-semibold text-[14px] tracking-wide leading-7 text-sidebarBlue mb-[1px]'>
						{title}
					</h3>
					<Toggler
						selected={all}
						label='All'
						onClick={(checked: boolean) => handleAllClick(checked)}
					/>
				</div>
			)}
			{categoryOptions.map((item: any) => (
				<Row key={item.value} style={{ display: 'block' }}>
					<Col>
						<Checkbox
							value={item.value}
							name={item.value}
							onChange={(e) => handleChange(e, item.value)}
							checked={item.selected}
						>
							{item.label}
						</Checkbox>
					</Col>
				</Row>
			))}
		</div>
	);
}
