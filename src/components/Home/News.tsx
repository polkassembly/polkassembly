// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTheme } from 'next-themes';
import React, { FC } from 'react';
import { TwitterTimelineEmbed } from 'react-twitter-embed';

interface INewsProps {
	twitter: string;
}

const News: FC<INewsProps> = (props) => {
	const { twitter } = props;
	const { resolvedTheme: theme } = useTheme();
	console.log(theme, 'this is theme, in twitter');
	let profile = 'polkadot';
	if (twitter) {
		profile = twitter.split('/')[3];
	}
	return (
		<div className='h-[520px] rounded-xxl bg-white p-4 drop-shadow-md dark:bg-section-dark-overlay lg:h-[550px] lg:p-6'>
			<h2 className='mb-6 text-xl font-medium leading-8 leading-8 text-blue-light-high dark:text-blue-dark-high'>News</h2>

			<div>
				<TwitterTimelineEmbed
					sourceType='profile'
					screenName={profile}
					options={{ height: 450 }}
					noHeader={true}
					noFooter={true}
					theme={theme === 'dark' ? 'dark' : 'light'}
				/>
			</div>
		</div>
	);
};

export default News;
