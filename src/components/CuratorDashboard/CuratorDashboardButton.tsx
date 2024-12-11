// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useUserDetailsSelector } from '~src/redux/selectors';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ArrowRightOutlined } from '@ant-design/icons';
import { spaceGrotesk } from 'pages/_app';
import { useTranslation } from 'next-i18next';

function CuratorDashboardButton() {
	const { t } = useTranslation('common');
	const currentUser = useUserDetailsSelector();
	const address = currentUser?.loginAddress;

	const [curatorData, setCuratorData] = useState<any>(null);
	const [curatorRequestData, setCuratorRequestData] = useState<any>(null);

	const fetchCuratorBountiesData = async () => {
		if (!address) return;

		try {
			const substrateAddress = getSubstrateAddress(address);

			// Fetch general info
			const { data } = await nextApiClientFetch<any>('api/v1/bounty/curator/getCuratorGeneralInfo', {
				userAddress: substrateAddress
			});
			if (data) setCuratorData(data);

			// Fetch curator request data
			const { data: requestData } = await nextApiClientFetch<any>('/api/v1/bounty/curator/getReqCount', {
				userAddress: address
			});
			if (requestData) setCuratorRequestData(requestData);
		} catch (error) {
			console.error('Error fetching curator data:', error);
		}
	};

	const hasBounties = curatorData?.allBounties?.count > 0 || curatorData?.childBounties?.count > 0;
	const hasCuratorRequests = curatorRequestData?.curator > 0;
	const hasSubmissions = curatorRequestData?.submissions > 0;

	const shouldRenderLink = hasBounties || hasCuratorRequests || hasSubmissions;

	useEffect(() => {
		fetchCuratorBountiesData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	return (
		<div>
			{shouldRenderLink && (
				<CustomButton
					href='/bounty-dashboard/curator-dashboard'
					className={`h-full cursor-pointer rounded-xl border-none text-base font-bold text-white hover:text-white ${spaceGrotesk.className} ${spaceGrotesk.variable} px-6 py-3`}
					style={{
						background: `
							radial-gradient(395.27% 77.56% at 25.57% 34.38%, rgba(255, 255, 255, 0.30) 0%, rgba(255, 255, 255, 0.00) 100%),
							radial-gradient(192.36% 96% at -3.98% 12.5%, #4B33FF 13.96%, #83F 64.39%, rgba(237, 66, 179, 0.00) 100%),
							radial-gradient(107.92% 155.46% at 50% 121.74%, #F512EE 0%, #62A0FD 80.98%)
						`,
						boxShadow: '1px 1px 4px 0px rgba(255, 255, 255, 0.50) inset'
					}}
				>
					{t('curator_dashboard')} <ArrowRightOutlined className='-rotate-45 font-bold' />
				</CustomButton>
			)}
		</div>
	);
}

export default CuratorDashboardButton;
