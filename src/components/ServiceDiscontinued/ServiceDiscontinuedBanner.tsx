// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DISCONTINUED_SERVICE_DATE, DISCONTINUED_SERVICES } from 'src/global/discontinuedServices';

function ServiceDiscontinuedBanner({ network }: { network: string }) {
	const isDiscontinuedService = DISCONTINUED_SERVICES.includes(network);
	const isDiscontinuedDate = new Date(DISCONTINUED_SERVICE_DATE);
	const isDiscontinuedDateNotPassed = isDiscontinuedDate > new Date();

	return isDiscontinuedService && isDiscontinuedDateNotPassed ? (
		<div className='bg-service-discontinued-banner-gradient px-5 py-2 text-center text-sm font-medium text-white'>
			The services will be discontinued on{' '}
			{isDiscontinuedDate.toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/(\d+)(?=,)/, (match) => {
				const day = parseInt(match);
				const suffix = ['th', 'st', 'nd', 'rd'][day % 10 > 3 ? 0 : day % 10];
				return `${day}${suffix}`;
			})}
		</div>
	) : null;
}

export default ServiceDiscontinuedBanner;
