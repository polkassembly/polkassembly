// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import { TwitterTimelineEmbed } from 'react-twitter-embed';

interface INewsProps {
	twitter: string;
	theme?: string;
}

const News: FC<INewsProps> = (props) => {
	const { twitter, theme } = props;
	let profile = 'polkadot';
	if (twitter) {
		profile = twitter.split('/')[3];
	}
	return (
<<<<<<< HEAD
		<div className='bg-white dark:bg-section-dark-overlay drop-shadow-md p-4 lg:p-6 rounded-xxl h-[520px] lg:h-[550px]'>
			<h2 className='text-blue-light-high dark:text-blue-dark-high text-xl font-medium leading-8 leading-8 mb-6'>News</h2>
=======
		<div className='h-[520px] rounded-xxl bg-white p-4 drop-shadow-md lg:h-[550px] lg:p-6'>
			<h2 className='mb-6 text-xl font-medium leading-8 leading-8 text-bodyBlue'>News</h2>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29

			<div className='dark:bg-section-dark-overlay'>
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
