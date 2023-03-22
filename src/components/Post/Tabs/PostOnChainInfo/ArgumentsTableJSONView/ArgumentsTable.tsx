// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';

interface IArgumentsTableProps {
	className?: string,
	argumentsJSON: any,
}

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
							<td className='direct-data data-2'>
								{value as any}
							</td>
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