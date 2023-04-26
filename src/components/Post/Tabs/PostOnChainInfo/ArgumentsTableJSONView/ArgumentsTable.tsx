// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';

interface IArgumentsTableProps {
	className?: string,
	argumentsJSON: any,
}

const urlRegex = /(https?:\/\/[^\s]+)/g;

const constructAnchorTag = (value: string) => {
	if (!value) return value;
	const urls = value.match(urlRegex);
	if (urls) {
		urls?.forEach((url) => {
			value = value.replace(url, `<a class="text-pink_primary" href='${url}' target='_blank'>${url}</a>`);
		});
	}
	return value;
};

const ArgumentsTable: FC<IArgumentsTableProps> = ({ argumentsJSON }) => {
	if (!argumentsJSON) return null;
	return (
		<>
			{Object.entries(argumentsJSON).map(([name, value], index) => (
				<tr key={index}>
					<td className='direct-data data-0'>
						{name}
					</td>
					{
						typeof value !== 'object'?
							<td dangerouslySetInnerHTML={{
								__html: constructAnchorTag(value as any)
							}} className='direct-data data-2'/>
							: <td className='indirect-data data-1'>
								<ArgumentsTable argumentsJSON={value} />
							</td>
					}
				</tr>
			))}
		</>
	);
};

export default ArgumentsTable;