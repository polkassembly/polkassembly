// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTheme } from 'next-themes';
import React, { FC, useEffect, useState } from 'react';
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import Loader from '~src/ui-components/Loader';

interface INewsProps {
	twitter: string;
}

const News: FC<INewsProps> = (props) => {
	const { twitter } = props;
	const { resolvedTheme: theme } = useTheme();
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

	let profile = 'polkadot';
	if (twitter) {
		profile = twitter.split('/')[3];
	}

	useEffect(() => {
		const handleResize = () => {
			setWindowWidth(window.innerWidth);
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		setIsLoading(true);
	}, [theme, windowWidth]);

	return (
		<div className='h-[520px] rounded-xxl bg-white p-4 drop-shadow-md dark:bg-section-dark-overlay lg:h-[550px] lg:p-6'>
			<h2 className='mb-6 text-xl font-semibold leading-8 tracking-tight text-blue-light-high dark:text-blue-dark-high'>News</h2>
			<div className='overflow-hidden rounded-[10px]'>
				{isLoading && <Loader iconClassName={'text-7xl mt-32'} />}
				<TwitterTimelineEmbed
					key={`${theme}-${windowWidth}`}
					onLoad={() => setIsLoading(false)}
					sourceType='profile'
					screenName={profile}
					options={{ height: 450 }}
					noHeader={true}
					noFooter={true}
					theme={theme === 'dark' ? 'dark' : 'light'}
					noBorders
				/>
			</div>
		</div>
	);
};

export default News;
