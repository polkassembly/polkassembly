// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState, useEffect, useRef } from 'react';
import QuoteIcon from '~assets/icons/quote-icon.svg';
import TwitterIcon from '~assets/icons/twitter.svg';

import { useUserDetailsSelector } from '~src/redux/selectors';
import { useQuoteCommentContext } from '~src/context';
import { usePostDataContext } from '~src/context';
import { CopyIcon } from './CustomIcons';
import copyToClipboard from '~src/util/copyToClipboard';
import { message } from 'antd';

interface IHiglightMenuProps {
	markdownRef: React.RefObject<HTMLDivElement>;
	isUsedInComments?: boolean;
}

const HighlightMenu = ({ markdownRef, isUsedInComments }: IHiglightMenuProps) => {
	const { setQuotedText } = useQuoteCommentContext();
	const { postData } = usePostDataContext();
	const [messageApi, contextHolder] = message.useMessage();
	const { id } = useUserDetailsSelector();
	const [selectedText, setSelectedText] = useState('');
	const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });

	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const markdown = markdownRef.current;

		if (!markdown) return;

		const handleSelection = () => {
			const selection = window.getSelection();
			const text = selection?.toString().trim();

			if (text !== '') {
				const range = selection?.getRangeAt(0);
				const rect = range?.getBoundingClientRect();

				if (rect) {
					const markdownRect = markdown.getBoundingClientRect();
					setMenuPosition({
						left: rect.left - markdownRect.left + rect.width / 2 - 30,
						top: rect.top - markdownRect.top + 160
					});
				}

				text && setSelectedText(text);
			}
		};

		const clearSelection = () => {
			if (selectedText) {
				// document.getSelection()?.removeAllRanges();
				setTimeout(() => {
					setSelectedText('');
				}, 250);
			}
		};

		markdown?.addEventListener('pointerup', handleSelection);

		document?.addEventListener('pointerdown', clearSelection);

		return () => {
			markdown?.removeEventListener('pointerup', handleSelection);
			document?.removeEventListener('pointerdown', clearSelection);
		};
	}, [markdownRef, selectedText]);

	const shareSelection = (event: React.MouseEvent) => {
		const twitterText = `${selectedText} -- ${postData.proposer} ${window.location.href}`;
		const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;

		window.open(twitterLink, '_blank');
		event.stopPropagation();
		setSelectedText('');
	};

	const handleQuote = () => {
		setQuotedText(selectedText);
		const commentForm = document.getElementById(isUsedInComments ? 'reply-content-form' : 'comment-form');

		const commentLogin = document.getElementById('comment-login-prompt');

		id ? commentForm?.scrollIntoView({ behavior: 'smooth', block: 'center' }) : commentLogin?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	};

	const handleCopy = () => {
		copyToClipboard(selectedText || '');
		messageApi.open({
			content: 'Text copied to clipboard',
			type: 'success'
		});
	};

	return (
		<div
			ref={menuRef}
			className={`fixed z-[999] ${
				selectedText ? 'block' : 'hidden'
			} flex w-20 flex-col justify-start gap-2 rounded-md bg-highlightBg p-3 text-sm text-white after:absolute after:left-[65%] after:top-[64px] after:border-8 after:border-b-0 after:border-solid after:border-highlightBg after:border-l-transparent after:border-r-transparent after:content-['']`}
			style={!isUsedInComments ? { left: menuPosition.left, top: menuPosition.top - 10 } : {}}
		>
			<div
				className='flex h-4 cursor-pointer items-center justify-between gap-1'
				onClick={handleQuote}
			>
				<QuoteIcon className='w-3' />
				Quote
			</div>
			<div
				className='flex h-4 cursor-pointer items-center justify-between gap-1'
				onClick={shareSelection}
			>
				<TwitterIcon className='w-3 fill-white' />
				Share
			</div>
			<div
				className='z-50 flex cursor-pointer items-center justify-between gap-x-1'
				onClick={handleCopy}
			>
				{contextHolder}
				<CopyIcon className='text-base' />
				Copy
			</div>
		</div>
	);
};

export default HighlightMenu;
