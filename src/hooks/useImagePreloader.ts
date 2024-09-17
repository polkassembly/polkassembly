// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useState, useEffect } from 'react';

const useImagePreloader = (imageSrc: string) => {
	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	useEffect(() => {
		const img = new Image();
		img.src = imageSrc;
		img.onload = () => {
			setIsLoaded(true);
		};
		return () => {
			img.onload = null;
		};
	}, [imageSrc]);
	return isLoaded;
};
export default useImagePreloader;
