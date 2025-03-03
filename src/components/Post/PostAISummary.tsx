// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { usePostDataContext } from '~src/context';
import Markdown from '~src/ui-components/Markdown';
import { sanitizeSummary } from './PostSummary';
import EvalutionSummary from './PostSummary/EvalutionSummary';

const PostAISummary = () => {
	const {
		postData: { summary }
	} = usePostDataContext();
	return (
		<div className='-ml-3 mt-3'>
			<Markdown
				className='md text-sm font-normal leading-[26px] tracking-[0.14px] text-bodyBlue dark:text-blue-dark-high'
				md={sanitizeSummary(summary || '')}
			/>
			<div className='mt-4 border-0 border-t-[1.5px] border-dashed border-section-light-container' />
			<div className='px-8'>
				<EvalutionSummary />
			</div>
		</div>
	);
};

export default PostAISummary;
