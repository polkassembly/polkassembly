// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { setNetwork } from '~src/redux/network';
import SEOHead from '~src/global/SEOHead';
import AccountsMain from '~src/components/Accounts';
// import { isOpenGovSupported } from '~src/global/openGovNetworks';

interface IAccountsProps {
	network: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const network = getNetworkFromReqHeaders(context.req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	// if (!isOpenGovSupported(network)) {
	// return {
	// props: {},
	// redirect: {
	// destination: '/'
	// }
	// };
	// }

	const props: IAccountsProps = {
		network
	};
	return { props: props };
};

const AccountSection: FC<IAccountsProps> = (props) => {
	const { network } = props;
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	return (
		<>
			<SEOHead
				title='Accounts'
				network={network}
			/>
			<AccountsMain />
		</>
	);
};

export default AccountSection;
