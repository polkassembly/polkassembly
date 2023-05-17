// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import checkGov2Route from 'src/util/checkGov2Route';
import { SyncIcon } from '~src/ui-components/CustomIcons';

interface Props {
	className?: string;
}

const GovernanceSwitchButton = ({ className } : Props) => {
	const router = useRouter();
	const { pathname , query, asPath } = router;
	const [previousRoute, setPreviousRoute] = useState(asPath);
	const isGov2Route: boolean = checkGov2Route(pathname, query, previousRoute );

	useEffect(() => {
		const handleRouteChange = () => {
			if(asPath.split('/')[1] !== 'discussions' && asPath.split('/')[1] !== 'post' ){
				setPreviousRoute(asPath);
			}
		};
		router.events.on('routeChangeStart', handleRouteChange);

		return () => {
			router.events.off('routeChangeStart', handleRouteChange);
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router]);

	return (
		<div className={`${className}`}>
			<Link className='m-0 border border-solid border-[rgba(72,95,125,0.2)] rounded-full flex items-center justify-center min-w-[200px] p-2 py-1' href={isGov2Route ? '/' : '/gov-2'}>
				<p className='text-sidebarBlue font-normal text-[10px] leading-[15px] tracking-[0.02em] m-0'>Switch to</p>
				<p className='font-poppins ml-[6px] mr-[11px] text-sidebarBlue text-xs font-semibold leading-[18px] tracking-[0.02em] m-0'> {isGov2Route ? 'Governance V1' : 'OpenGov'} </p>
				<p className='flex items-center justify-center text-navBlue text-base m-0'><SyncIcon /></p>
			</Link>
		</div>
	);
};

export default GovernanceSwitchButton;