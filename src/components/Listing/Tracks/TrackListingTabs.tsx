// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IReferendumV2PostsByStatus } from 'pages/root';
import React from 'react';
import { Tabs } from '~src/ui-components/Tabs';
import { useTheme } from 'next-themes';
import { TabsProps } from 'antd';
import TrackListingStatusTabs from './TrackListingStatusTabs';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import SkeletonAvatar from '~src/basic-components/Skeleton/SkeletonAvatar';
import { useTranslation } from 'next-i18next';

const TrackLevelAnalytics = dynamic(() => import('../../TrackLevelAnalytics'), {
	loading: () => <SkeletonAvatar active />,
	ssr: false
});

interface IProps {
	className?: string;
	posts: IReferendumV2PostsByStatus;
	trackName: string;
}

const TrackListingTabs = ({ className, posts, trackName }: IProps) => {
	const { t } = useTranslation('common');
	const { resolvedTheme: theme } = useTheme();
	const router = useRouter();
	const activeKey = router.query && !!router?.query['analytics'] ? '2' : '1';

	const tabItems: TabsProps['items'] = [
		{
			children: (
				<>
					<TrackListingStatusTabs
						posts={posts}
						trackName={trackName}
					/>
				</>
			),
			key: '1',
			label: <span className='px-1.5'>{t('referenda')}</span>
		},
		{
			children: (
				<>
					<TrackLevelAnalytics trackName={trackName} />
				</>
			),
			key: '2',
			label: <div className='flex items-center gap-2'>{t('analytics')}</div>
		}
	];

	const handleOnchange = (activeKey: string) => {
		switch (activeKey) {
			case '1':
				router.replace({
					...router,
					query: ''
				});
				break;
			case '2':
				router.replace({
					pathname: '',
					query: { ...router.query, analytics: true }
				});
		}
	};
	return (
		<div className={`${className} mt-6 rounded-xxl bg-white px-4 drop-shadow-md dark:bg-section-dark-overlay xs:py-4 sm:py-8`}>
			<Tabs
				activeKey={activeKey}
				onChange={handleOnchange}
				theme={theme}
				type='card'
				className=''
				items={tabItems}
			/>
		</div>
	);
};

export default TrackListingTabs;
