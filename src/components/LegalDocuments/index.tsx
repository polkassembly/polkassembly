// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { dmSans } from 'pages/_app';
import React from 'react';
import Markdown from 'src/ui-components/Markdown';

import getPrivacyPolicy from '~assets/privacy-policy';
import TOW from '~assets/terms-of-website';
import { useNetworkSelector } from '~src/redux/selectors';

interface Props {
	md: string;
}

const MdScreen = ({ md }: Props) => {
	return (
		<section>
			<article className={`${dmSans.variable} ${dmSans.className} mb-[-6px] whitespace-pre-wrap rounded-md bg-white p-4 text-sm dark:bg-section-dark-overlay`}>
				<Markdown
					className='markdown text-black'
					md={md}
				/>
			</article>
		</section>
	);
};

const StyledMdScreen = MdScreen;

export const PrivacyPolicy = () => {
	const { network } = useNetworkSelector();
	return <StyledMdScreen md={getPrivacyPolicy(network)} />;
};
export const TermsOfWebsite = () => <StyledMdScreen md={TOW} />;
