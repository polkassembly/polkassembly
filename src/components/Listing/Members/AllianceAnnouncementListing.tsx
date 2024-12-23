// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider, Space } from 'antd';
import React from 'react';
import { PostEmptyState } from 'src/ui-components/UIStates';

interface Props {
	className?: string;
	data: any[];
}

const AllianceAnnouncementsListing = ({ className, data }: Props) => {
	if (!data.length)
		return (
			<div className={className}>
				<PostEmptyState />
			</div>
		);

	return (
		<div className={`${className} motions__list`}>
			{data.map((member) => (
				<div
					key={member.codec}
					className='my-5'
				>
					<div className={`${className} rounded-md border-2 border-grey_light p-3 md:p-4`}>
						<div className='content'>
							<h1 className='text-sm font-medium text-sidebarBlue'>{member.hash.digest}</h1>
							<Space className='mt-3 flex flex-col items-start text-xs font-medium text-navBlue md:flex-row md:items-center'>
								<span>Version: {member.version}</span>
								<Divider
									className='hidden md:inline-block'
									type='vertical'
									style={{ borderLeft: '1px solid #90A0B7' }}
								/>
								<span>Code: {member.hash.code} </span>
								<Divider
									className='hidden md:inline-block'
									type='vertical'
									style={{ borderLeft: '1px solid #90A0B7' }}
								/>
								<span>Codec: {member.codec}</span>
							</Space>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

export default AllianceAnnouncementsListing;
