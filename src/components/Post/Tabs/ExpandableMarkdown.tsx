// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import React, { useState } from 'react';
import Markdown from 'src/ui-components/Markdown';

interface ExpandableMarkdownProps {
	md: string;
	theme?: string | undefined;
}

const ExpandableMarkdown: React.FC<ExpandableMarkdownProps> = ({ md, theme }) => {
	const [visibleEnd, setVisibleEnd] = useState(3200); // Show first 1000 characters initially
	const [isExpanded, setIsExpanded] = useState(false); // To track if content is expanded
	const chunkSize = 3200;

	const handleShowMore = () => {
		const newVisibleEnd = Math.min(visibleEnd + chunkSize, md.length);
		setVisibleEnd(newVisibleEnd);
		if (newVisibleEnd === md.length) {
			setIsExpanded(true); // Content is fully expanded
		}
	};

	const handleShowLess = () => {
		setVisibleEnd(chunkSize); // Reset to initial 1000 characters
		setIsExpanded(false); // Content is collapsed
		// Scroll to top
		window.scrollTo({
			behavior: 'smooth',
			top: 0
		});
	};

	const contentToDisplay = md.slice(0, visibleEnd);

	return (
		<div>
			<Markdown
				md={contentToDisplay}
				theme={theme}
			/>
			{visibleEnd < md.length && !isExpanded && (
				<div className='flex w-full justify-center'>
					<Button
						onClick={handleShowMore}
						className='mt-2 flex h-[30px] w-[120px] items-center justify-center rounded-2xl border-none bg-transparent text-center text-xs text-pink_primary shadow-lg'
					>
						Show More
					</Button>
				</div>
			)}
			{isExpanded && (
				<div className='flex w-full justify-center'>
					<button
						onClick={handleShowLess}
						className='mb-2 flex h-[30px] w-[120px] items-center justify-center rounded-2xl border-none bg-transparent text-center text-xs text-pink_primary shadow-lg'
					>
						Show Less
					</button>
				</div>
			)}
		</div>
	);
};

export default ExpandableMarkdown;
