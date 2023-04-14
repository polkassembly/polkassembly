// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Tabs } from 'antd';
import * as React from 'react';
import ReactJson from 'react-json-view';
import Address from 'src/ui-components/Address';
import styled from 'styled-components';

import ArgumentsTable from './ArgumentsTable';
import { u8aToString } from '@polkadot/util';

interface Props {
	className?: string
	postArguments: any
	showAccountArguments: boolean
}

function isHex(value: string) {
	return typeof value == 'string' && value.length % 2 == 0 && /^0x[a-f\d]*$/i.test(value);
}

function containsBinaryData(str: string) {
	const buffer = Buffer.from(str);

	for (let i = 0; i < buffer.length; i++) {
		if (buffer[i] < 32 || buffer[i] > 126) {
			return true;
		}
	}

	return false;
}

const convertAnyHexToASCII = (obj: any): any => {
	if (!obj) return obj;
	if (typeof obj === 'string') {
		if (isHex(obj)) {
			try {
				const str = u8aToString(Buffer.from(obj.replace('0x', ''), 'hex'));
				if (containsBinaryData(str)) {
					return obj;
				} else {
					return str;
				}
			} catch (err) {
				return obj;
			}
		} else {
			return obj;
		}
	} else if (Array.isArray(obj)) {
		return obj?.map(convertAnyHexToASCII);
	} if (typeof obj === 'object') {
		for (const key in obj) {
			obj[key] = convertAnyHexToASCII(obj[key]);
		}
	}
	return obj;
};

const ArgumentsTableJSONView = ({ className, postArguments, showAccountArguments }: Props) => {
	if(postArguments) {
		postArguments = convertAnyHexToASCII(postArguments);
		const tabItems = [
			{
				children: <div className="table-view">
					<table cellSpacing={0} cellPadding={0}>
						<thead>
							<tr>
								<th className='direct-data data-0'>
									Name
								</th>
								<th className='direct-data data-2'>
									Value
								</th>
							</tr>
						</thead>
						<tbody>
							<ArgumentsTable argumentsJSON={postArguments} />
						</tbody>
					</table>
				</div>,
				key: 'table',
				label: 'Table'
			},
			{
				children: <div className="json-view">
					<ReactJson
						src={postArguments}
						iconStyle='circle'
						enableClipboard={false}
						displayDataTypes={false}
					/>
				</div>,
				key: 'json',
				label: 'JSON'
			}
		];

		return (
			<div className={className}>
				<Tabs
					className='onchain-tabs'
					defaultActiveKey="table"
					items={tabItems}
				/>

				{
					!showAccountArguments && postArguments.map((element:any, index:any) => {
						return element.name === 'account' && <div key={index}>
							<Address address={element.value} key={index}/>
						</div>;
					})
				}
			</div>
		);
	} else {
		return (<div></div>);
	}

};

export default styled(ArgumentsTableJSONView)`
	.onchain-tabs .ant-tabs-tab{
		background: transparent !important;
	}
`;