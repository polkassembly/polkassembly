// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DISCONTINUED_SERVICE_DATE, DISCONTINUED_SERVICES } from 'src/global/discontinuedServices';
import dayjs from 'dayjs';

function ServiceDiscontinuedBanner({ network }: { network: string }) {
	const isDiscontinuedService = DISCONTINUED_SERVICES.includes(network);
	const discontinuedDate = dayjs(DISCONTINUED_SERVICE_DATE);
	const isBeforeDiscontinuationDate = discontinuedDate.isAfter(dayjs());

	return isDiscontinuedService && isBeforeDiscontinuationDate ? (
		<div className='bg-service-discontinued-banner-gradient px-5 py-2 text-center text-sm font-medium text-white'>
			The services will be discontinued on {discontinuedDate.format('Do MMMM YYYY')}
		</div>
	) : null;
}

export default ServiceDiscontinuedBanner;
