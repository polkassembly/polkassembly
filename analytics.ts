// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import ReactGA from 'react-ga4';
import { chainProperties } from '~src/global/networkConstants';
export const initGA = (network: string) => {
	ReactGA.initialize(chainProperties[network].gTag || '');
};

export const logPageView = () => {
	ReactGA.set({ page: window.location.pathname });
	ReactGA.send('pageview');
};

export const trackEvent = (category: string, action: string, label: object = {}) => {
	console.log(category, action, label);
	const serializedLabel = JSON.stringify(label);
	ReactGA.event({
		action,
		category,
		label: serializedLabel,
		nonInteraction: true,
		transport: 'xhr'
	});
};
