// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useState } from 'react';

function isMobileBrowser(): boolean {
	const userAgent = navigator.userAgent;
	const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
	const isTouchDevice = navigator.maxTouchPoints > 0;

	return isMobileUserAgent || isTouchDevice;
}

const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			const isMobile = typeof window !== 'undefined' && window?.screen.width < 768;
			setIsMobile(isMobile || isMobileBrowser());
		};
		handleResize();
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return isMobile;
};

export default useIsMobile;
