// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import ReactGA from 'react-ga';

export const initGA = () => {
    ReactGA.initialize('UA-277990774-1'); // Replace with your own tracking ID
};

export const logPageView = () => {
    ReactGA.set({ page: window.location.pathname });
    ReactGA.pageview(window.location.pathname);
};

export const trackEvent = (category: string, action: string, label: string) => {
    ReactGA.event({
        category,
        action,
        label
    });
};