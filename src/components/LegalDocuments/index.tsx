// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { poppins } from 'pages/_app';
import React from 'react';
import Markdown from 'src/ui-components/Markdown';

import getPrivacyPolicy from '~assets/privacy-policy';
import TOW from '~assets/terms-of-website';
import { useNetworkContext } from '~src/context';

interface Props {
	md: string;
}

const MdScreen = ({ md }: Props) => {
	return (
		<section>
<<<<<<< HEAD
			<article className={`${poppins.variable} ${poppins.className} bg-white dark:bg-section-dark-overlay text-sm rounded-md whitespace-pre-wrap mb-[-6px]`}>
				<Markdown className="markdown text-black" md={md}/>
=======
			<article className={`${poppins.variable} ${poppins.className} mb-[-6px] whitespace-pre-wrap rounded-md bg-white text-sm`}>
				<Markdown
					className='markdown text-black'
					md={md}
				/>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
			</article>
		</section>
	);
};

const StyledMdScreen = MdScreen;

export const PrivacyPolicy = () => {
	const { network } = useNetworkContext();
	return <StyledMdScreen md={getPrivacyPolicy(network)} />;
};
export const TermsOfWebsite = () => <StyledMdScreen md={TOW} />;
