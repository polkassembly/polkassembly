import { GetServerSideProps } from 'next';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { setNetwork } from '~src/redux/network';
import SEOHead from '~src/global/SEOHead';
import AccountsMain from '~src/components/Accounts';

interface IAccountsProps {
	// userProfile: {
	// 	data: ProfileDetails;
	// 	error: string | null;
	// };
	network: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const address = context.params?.address;

	const network = getNetworkFromReqHeaders(context.req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	// const { data, error } = await getProfileWithAddress({
	// 	address
	// });
	const props: IAccountsProps = {
		network
		// AccountsData: {
		// 	data: data?.profile || {
		// 		achievement_badges: [],
		// 		badges: [],
		// 		bio: '',
		// 		image: '',
		// 		social_links: [],
		// 		title: ''
		// 	},
		// 	error: error
		// }
	};
	return { props: props };
};

const AccountSection: FC<IAccountsProps> = (props) => {
	const { network } = props;
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
