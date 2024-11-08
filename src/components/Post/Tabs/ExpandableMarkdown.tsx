// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'src/ui-components/Markdown';

interface ExpandableMarkdownProps {
	md: string;
	theme?: string | undefined;
}

const ExpandableMarkdown: React.FC<ExpandableMarkdownProps> = ({ md, theme }) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isContentOverflowing, setIsContentOverflowing] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const checkOverflow = () => {
			if (contentRef.current) {
				setIsContentOverflowing(contentRef.current.scrollHeight > 301);
			}
		};

		const timeout = setTimeout(checkOverflow, 100);

		const observer = new MutationObserver(checkOverflow);
		if (contentRef.current) {
			observer.observe(contentRef.current, { childList: true, subtree: true });
		}

		return () => {
			clearTimeout(timeout);
			observer.disconnect();
		};
	}, [md]);

	const handleShowMore = () => {
		setIsExpanded(true);
	};

	const handleShowLess = () => {
		setIsExpanded(false);
	};

	return (
		<div>
			<div
				ref={contentRef}
				id='expandable-content'
				className={`${isExpanded ? 'h-auto' : 'h-[301px]'} overflow-hidden`}
			>
				<Markdown
					md={md}
					theme={theme}
				/>
			</div>
			{isContentOverflowing && (
				<div className='flex w-full justify-center'>
					<p
						onClick={isExpanded ? handleShowLess : handleShowMore}
						className='m-0 my-2 flex h-[30px] w-[120px] cursor-pointer items-center border-none bg-transparent p-0 text-center text-sm font-medium text-pink_primary'
						style={{ textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
					>
						{isExpanded ? 'Show Less' : 'Show More'}
					</p>
				</div>
			)}
			<Divider className='border-1 my-0 -mr-4 mt-1 bg-[#f4f5f6] text-lightBlue dark:bg-separatorDark' />
		</div>
	);
};

export default ExpandableMarkdown;
