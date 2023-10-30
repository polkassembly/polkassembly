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

export const trackEvent = (category: string, action: string, label: string) => {
	ReactGA.event({
		action,
		category,
		label,
		transport: 'xhr'
	});
};
