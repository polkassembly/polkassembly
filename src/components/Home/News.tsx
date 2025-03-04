import { useTheme } from 'next-themes';
import React, { FC, useEffect, useState } from 'react';
import Loader from '~src/ui-components/Loader';

interface INewsProps {
	twitter: string;
}

const News: FC<INewsProps> = ({ twitter }) => {
	const { resolvedTheme: theme } = useTheme();
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isIOS, setIsIOS] = useState<boolean>(false);
	const profile = twitter ? twitter.split('/')[3] : 'polkadot';

	useEffect(() => {
		// Detect iOS
		const userAgent = navigator.userAgent || navigator.vendor;
		setIsIOS(/iPad|iPhone|iPod/.test(userAgent));

		// Load Twitter widget script
		const script = document.createElement('script');
		script.src = 'https://platform.twitter.com/widgets.js';
		script.async = true;
		script.onload = () => {
			setIsLoading(false);
			if (window.twttr && window.twttr.widgets) {
				window.twttr.widgets.load();
			}
		};
		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	useEffect(() => {
		// Force reload widget on theme change
		if (window.twttr && window.twttr.widgets) {
			window.twttr.widgets.load();
		}
	}, [theme]);

	return (
		<div className='h-[520px] rounded-xxl bg-white p-4 drop-shadow-md dark:bg-section-dark-overlay lg:h-[550px] lg:p-6'>
			<h2 className='mb-6 text-xl font-semibold leading-8 tracking-tight text-blue-light-high dark:text-blue-dark-high'>News {isIOS ? 'yes' : 'no'}</h2>
			<div className='overflow-hidden rounded-[10px]'>
				{isLoading && <Loader iconClassName={'text-7xl mt-32'} />}

				{/* Twitter Embed with Manual Load */}
				<a
					className='twitter-timeline'
					data-theme={theme === 'dark' ? 'dark' : 'light'}
					data-height='450'
					data-chrome='noheader nofooter noborders'
					href={`https://twitter.com/${profile}`}
				>
					Tweets by {profile}
				</a>
			</div>
		</div>
	);
};

export default News;
