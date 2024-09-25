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
	const [height, setHeight] = useState(301); // Initial height of 301px
	const [isExpanded, setIsExpanded] = useState(false);
	const heightIncrement = 301;

	const handleShowMore = () => {
		const contentHeight = document.getElementById('expandable-content')?.scrollHeight || 0;
		const newHeight = Math.min(height + heightIncrement, contentHeight);
		setHeight(newHeight);
		if (newHeight >= contentHeight) {
			setIsExpanded(true);
		}
	};

	const handleShowLess = () => {
		const newHeight = Math.max(height - heightIncrement, 301); // Decrease height but not below 301px
		setHeight(newHeight);

		// Scroll up by 301px
		window.scrollBy({
			behavior: 'smooth',
			top: -heightIncrement
		});

		if (newHeight === 301) {
			setIsExpanded(false);
		}
	};

	return (
		<div>
			<div
				id='expandable-content'
				style={{ maxHeight: `${height}px`, overflow: 'hidden', transition: 'max-height 0.3s ease-in-out' }}
			>
				<Markdown
					md={md}
					theme={theme}
				/>
			</div>
			{height < (document.getElementById('expandable-content')?.scrollHeight || 0) && !isExpanded && (
				<div className='flex w-full justify-center'>
					<Button
						onClick={handleShowMore}
						className='my-1 flex h-[30px] w-[120px] items-center justify-start border-none bg-transparent p-0 text-center text-sm font-normal text-pink_primary'
						style={{ textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
					>
						Show More
					</Button>
				</div>
			)}
			{isExpanded && (
				<div className='flex w-full justify-center'>
					<button
						onClick={handleShowLess}
						className='mb-2 flex h-[30px] w-[120px] items-center justify-start border-none bg-transparent p-0 text-center text-sm font-normal text-pink_primary'
						style={{ textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
					>
						Show Less
					</button>
				</div>
			)}
		</div>
	);
};

export default ExpandableMarkdown;
