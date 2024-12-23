// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import * as React from 'react';
import ReactJson from 'react-json-view';
import Address from 'src/ui-components/Address';
import styled from 'styled-components';
import ArgumentsTable from './ArgumentsTable';
import { Tabs } from '~src/ui-components/Tabs';

interface Props {
	className?: string;
	postArguments: any;
	showAccountArguments: boolean;
	theme?: string;
}

const ArgumentsTableJSONView = ({ className, postArguments, showAccountArguments, theme }: Props) => {
	if (postArguments) {
		const tabItems = [
			{
				children: (
					<div className='table-view'>
						<table
							cellSpacing={0}
							cellPadding={0}
						>
							<thead>
								<tr>
									<th className='direct-data data-0 dark:bg-[#222] dark:text-white'>Name</th>
									<th className='direct-data data-2 dark:bg-[#222] dark:text-white'>Value</th>
								</tr>
							</thead>
							<tbody>
								<ArgumentsTable argumentsJSON={postArguments} />
							</tbody>
						</table>
					</div>
				),
				key: 'table',
				label: 'Table'
			},
			{
				children: (
					<div className='json-view'>
						<ReactJson
							theme={theme === 'dark' ? 'monokai' : 'rjv-default'}
							src={postArguments}
							iconStyle='circle'
							enableClipboard={false}
							displayDataTypes={false}
						/>
					</div>
				),
				key: 'json',
				label: 'JSON'
			}
		];

		return (
			<div className={className}>
				<Tabs
					theme={theme}
					className='onchain-tabs'
					defaultActiveKey='table'
					items={tabItems}
				/>

				{!showAccountArguments &&
					postArguments.map((element: any, index: any) => {
						return (
							element.name === 'account' && (
								<div key={index}>
									<Address
										address={element.value}
										key={index}
									/>
								</div>
							)
						);
					})}
			</div>
		);
	} else {
		return <div></div>;
	}
};

export default styled(ArgumentsTableJSONView)`
	.onchain-tabs .ant-tabs-tab {
		background: transparent !important;
	}
	.ant-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
		color: ${(props: any) => (props.theme == 'dark' ? '#e5007a' : '')} !important;
	}
	.ant-tabs-tab-active {
		border: ${(props: any) => (props.theme == 'dark' ? 'none' : '')} !important;
	}
	.ant-tabs-tab-btn {
		color: ${(props: any) => (props.theme == 'dark' ? '#909090' : '')} !important;
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		white-space: nowrap;
	}
`;
