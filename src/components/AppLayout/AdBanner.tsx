// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useRef } from 'react';
import { useNetworkSelector } from '~src/redux/selectors';

const AD_CDN_HOSTS = ['cdn.bmcdn6.com'];

const DEFAULT_AD_SCRIPT_ID = '69907926ce3e72c001469af9';

// Network-specific ad script IDs — add new subdomain entries here
const NETWORK_AD_SCRIPT_IDS: Record<string, string> = {
	pendulum: '69932b3fce3e72c0014e7889'
};

const AdBanner = () => {
	const { network } = useNetworkSelector();
	const adScriptId = NETWORK_AD_SCRIPT_IDS[network] || DEFAULT_AD_SCRIPT_ID;

	const adRef = useRef<HTMLDivElement>(null);
	const loadedScriptId = useRef<string | null>(null);

	useEffect(() => {
		if (!adScriptId || loadedScriptId.current === adScriptId) return;
		loadedScriptId.current = adScriptId;

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

		loadAdScript(document, 'script', adScriptId, AD_CDN_HOSTS, 0, new Date().getTime());
	}, [adScriptId]);

	return (
		<div
			ref={adRef}
			className='mx-auto mb-4 hidden w-full items-center justify-center md:flex'
		>
			<ins
				className={adScriptId}
				style={{ display: 'inline-block', height: '90px', width: '728px' }}
			/>
		</div>
	);
};

export default AdBanner;
