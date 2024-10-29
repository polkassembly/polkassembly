// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useUserDetailsSelector } from '~src/redux/selectors';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ArrowRightOutlined } from '@ant-design/icons';
import { spaceGrotesk } from 'pages/_app';

function CuratorDashboardButton() {
	const currentUser = useUserDetailsSelector();
	const address = currentUser?.loginAddress;
	const [curatorData, setCuratorData] = React.useState<any>();
	const [curatorrequestdata, setCuratorRequestData] = React.useState<any>();

	const fetchCuratorBountiesData = async () => {
		if (address) {
			const substrateAddress = getSubstrateAddress(address);
			const { data } = await nextApiClientFetch<any>('api/v1/bounty/curator/getCuratorGeneralInfo', {
				userAddress: substrateAddress
			});
			const { data: curatorrequestdata } = await nextApiClientFetch<any>('/api/v1/bounty/curator/getReqCount', {
				userAddress: currentUser?.loginAddress
			});
			if (curatorrequestdata) {
				setCuratorRequestData(curatorrequestdata);
			}
			if (data) {
				setCuratorData(data);
			}
		}
	};
	const hasBounties = curatorData?.allBounties?.count > 0 || curatorData?.childBounties?.count > 0;
	const hasCuratorRequests = curatorrequestdata?.curator > 0;
	const hasSubmissions = curatorrequestdata?.submissions > 0;

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
					Curator Dashboard <ArrowRightOutlined className='-rotate-45 font-bold' />
				</CustomButton>
			)}
		</div>
	);
}

export default CuratorDashboardButton;
