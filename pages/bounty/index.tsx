// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import BountiesContainer from '~src/components/Bounties';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { setNetwork } from '~src/redux/network';

export const getServerSideProps: GetServerSideProps = async (context) => {
	const network = getNetworkFromReqHeaders(context.req.headers);
	if (network != 'polkadot') {
		return {
			props: {},
			redirect: {
				destination: isOpenGovSupported(network) ? '/opengov' : '/'
			}
		};
	}
	return {
		props: {
			network: network
		}
	};
};

interface IBountyProps {
	network: string;
}

const Bounty: React.FC<IBountyProps> = ({ network }) => {
	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);
	return (
		<>
			<BountiesContainer />
		</>
	);
};

export default Bounty;
