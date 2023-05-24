// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Checkbox, Col, Row } from 'antd';
import React from 'react';
import Tips from '~assets/icons/tips.svg';
import Toggler from './Toggler';
type Props = {
    categoryOptions: any;
    title?: string;
    sortedList?: any;
    unsortedList?: any;
    classname?: string;
    Icon?: any;
};

export default function GroupCheckbox({
	categoryOptions,
	sortedList,
	unsortedList,
	title,
	classname,
	Icon
}: Props) {
	return (
		<div className={classname}>
			{!!title && (
				<div className='flex items-center gap-[4px] mb-[16px]'>
					{title && Icon ? <Icon/> : <Tips className='w-[20px] h-[20px]' />}

					<h3 className='font-semibold text-[14px] tracking-wide leading-7 text-sidebarBlue mb-[1px]'>
						{title}
					</h3>
					<Toggler selected={false} label='All' />
				</div>
			)}
			{sortedList || unsortedList ? (
				<div className='pl-[20px] flex flex-col gap-[12px] mb-[16px]'>
					{!!sortedList && (
						<ol className='m-0'>
							{sortedList.map(
								({
									label,
									value
								}: {
                                    label: string;
                                    value: string;
                                }) => (
									<li
										key={value}
										className='font-semibold text-[14px] tracking-wide leading-7 text-sidebarBlue mb-[1px]'
									>
										{label}
									</li>
								)
							)}
						</ol>
					)}
					{!!unsortedList && (
						<ul className='m-0'>
							{unsortedList.map(
								({
									label,
									value
								}: {
                                    label: string;
                                    value: string;
                                }) => (
									<li
										key={value}
										className='font-semibold text-[14px] tracking-wide leading-7 text-sidebarBlue mb-[1px]'
									>
										{label}
									</li>
								)
							)}
						</ul>
					)}
				</div>
			) : null}
			<Checkbox.Group className='flex flex-col gap-[8px]'>
				{categoryOptions.map((item: any) => (
					<Row key={item.value} style={{ display: 'block' }}>
						<Col>
							<Checkbox value={item.value}>{item.label}</Checkbox>
						</Col>
					</Row>
				))}
			</Checkbox.Group>
		</div>
	);
}
