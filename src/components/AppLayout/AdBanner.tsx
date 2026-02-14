// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useRef } from 'react';

const AD_SCRIPT_ID = '69907926ce3e72c001469af9';
const AD_CDN_HOSTS = ['cdn.bmcdn6.com'];

const AdBanner = () => {
	const adRef = useRef<HTMLDivElement>(null);
	const scriptLoaded = useRef(false);

	useEffect(() => {
		if (scriptLoaded.current) return;
		scriptLoaded.current = true;

		const loadAdScript = (doc: Document, tagName: string, adId: string, hosts: string[], hostIndex: number, cacheBuster?: number) => {
			const firstScript = doc.getElementsByTagName(tagName)[0];
			const newScript = doc.createElement(tagName) as HTMLScriptElement;
			newScript.async = true;
			newScript.src = `https://${hosts[hostIndex]}/js/${adId}.js?v=${cacheBuster || new Date().getTime()}`;
			newScript.onerror = function () {
				newScript.remove();
				const nextIndex = hostIndex + 1;
				if (nextIndex < hosts.length) {
					loadAdScript(doc, tagName, adId, hosts, nextIndex, cacheBuster);
				}
			};
			firstScript?.parentNode?.insertBefore(newScript, firstScript);
		};

		loadAdScript(document, 'script', AD_SCRIPT_ID, AD_CDN_HOSTS, 0, new Date().getTime());
	}, []);

	return (
		<div
			ref={adRef}
			className='mx-auto mb-4 hidden w-full items-center justify-center md:flex'
		>
			<ins
				className={AD_SCRIPT_ID}
				style={{ display: 'inline-block', height: '90px', width: '728px' }}
			/>
		</div>
	);
};

export default AdBanner;
