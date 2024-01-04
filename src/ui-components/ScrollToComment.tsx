// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useState, useEffect, useRef, useCallback } from 'react';
import ScrollDownIcon from '~assets/icons/keyboard-double-arrow-down.svg';
import Tooltip from '~src/basic-components/Tooltip';

const ScrollToCommentsButton = () => {
	const [isVisible, setIsVisible] = useState(false);
	const commentsSectionRef = useRef<HTMLElement | null>(null);

	const toggleVisibility = useCallback(() => {
		commentsSectionRef.current = document.getElementById('comments-section');
		if (!commentsSectionRef.current) {
			setIsVisible(false);
			return;
		}
		const rect = commentsSectionRef.current.getBoundingClientRect();
		const isInView = (rect.top >= 0 && rect.bottom <= window.innerHeight) || rect.bottom <= 0;

		if (isInView) {
			setIsVisible(false);
		} else {
			setIsVisible(true);
		}
	}, []);

	const scrollToComments = useCallback(() => {
		if (!commentsSectionRef.current) return;
		const rect = commentsSectionRef.current.getBoundingClientRect();
		const topOffset = 80;

		window.scrollTo({
			behavior: 'smooth',
			top: rect.top + window.pageYOffset - topOffset
		});
	}, []);

	useEffect(() => {
		window.addEventListener('scroll', toggleVisibility);
		return () => {
			window.removeEventListener('scroll', toggleVisibility);
		};
	}, [toggleVisibility]);

	return (
		<Tooltip title='Scroll to comments'>
			<div
				className={`fixed bottom-8 right-24 z-10 cursor-pointer ${isVisible ? '' : 'hidden'}`}
				onClick={scrollToComments}
			>
				<ScrollDownIcon />
			</div>
		</Tooltip>
	);
};

export default ScrollToCommentsButton;
