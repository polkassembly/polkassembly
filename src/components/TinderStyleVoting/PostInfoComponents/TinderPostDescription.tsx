// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import Markdown from '~src/ui-components/Markdown';

interface ITinderPostDescription {
	postContent: any;
}
const TinderPostDescription: FC<ITinderPostDescription> = (props) => {
	const { postContent } = props;
	const sanitizeSummary = (md: string) => {
		const newMd = (md || '').trim();
		return newMd;
	};

	return (
		<section className='pr-2'>
			<p>
				<Markdown
					className='md text-sm font-normal leading-[26px] tracking-[0.14px] text-bodyBlue dark:text-blue-dark-high'
					md={sanitizeSummary(postContent || '')}
				/>
			</p>
		</section>
	);
};

export default TinderPostDescription;
