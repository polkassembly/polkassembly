// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useState, useEffect } from 'react';
import ScrollIcon from '~assets/icons/keyboard-double-arrow-up.svg';
const ScrollToTopButton = () => {
	const [isVisible, setIsVisible] = useState(false);

	const toggleVisibility = () => {
		if (window.pageYOffset > 300) {
			setIsVisible(true);
		} else {
			setIsVisible(false);
		}
	};

	const scrollToTop = () => {
		window.scrollTo({
			behavior: 'smooth',
			top: 0
		});
	};

	useEffect(() => {
		window.addEventListener('scroll', toggleVisibility);
		return () => {
			window.removeEventListener('scroll', toggleVisibility);
		};
	}, []);

	return (
		<div className={`fixed bottom-8 right-24 cursor-pointer ${isVisible ? '' : 'hidden'}`} onClick={scrollToTop}>
			<ScrollIcon/>
		</div>
	);
};

export default ScrollToTopButton;