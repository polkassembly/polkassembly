// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Col, Row, Skeleton } from 'antd';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Web2Login from 'src/components/Login/Web2Login';
import { Wallet } from 'src/types';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import { useUserDetailsSelector } from '~src/redux/selectors';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
// import useHandleMetaMask from '~src/hooks/useHandleMetaMask';

interface Props {
	network: string;
	isModal?: boolean;
	setLoginOpen?: (pre: boolean) => void;
	setSignupOpen?: (pre: boolean) => void;
	isDelegation?: boolean;
}

const Web3Login = dynamic(() => import('src/components/Login/Web3Login'), {
	loading: () => <Skeleton active />,
	ssr: false
});
const MetamaskLogin = dynamic(() => import('src/components/Login/MetamaskLogin'), {
	loading: () => <Skeleton active />,
	ssr: false
});
const WalletConnectLogin = dynamic(() => import('src/components/Login/WalletConnectLogin'), {
	loading: () => <Skeleton active />,
	ssr: false
});

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	return { props: { network } };
};

const Login = ({ network, setLoginOpen, setSignupOpen, isModal, isDelegation }: Props) => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setNetwork(network));

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const { id } = useUserDetailsSelector();
	const router = useRouter();
	const [displayWeb, setDisplayWeb] = useState(2);
	const [chosenWallet, setChosenWallet] = useState<Wallet | null>(null);
	const [walletError, setWalletError] = useState<string | undefined>();
	const [withPolkasafe, setWithPolkasafe] = useState<boolean>(false);

	const setDisplayWeb2 = () => setDisplayWeb(2);

	const onWalletSelect = (wallet: Wallet) => {
		setChosenWallet(wallet);
		setDisplayWeb(3);
	};

	// TODO: FIX ambiguous function name
	const onWalletUpdate = () => {
		setChosenWallet(null);
		setWithPolkasafe(false);
		setDisplayWeb(2);
	};

	const setPolkadotWallet = () => {
		onWalletSelect(Wallet.POLKADOT);
	};

	useEffect(() => {
		if (id && !isModal) {
			router.push('/');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, router]);
	return (
		<>
			<SEOHead
				title='Login'
				network={network}
			/>
			<Row
				justify='center'
				align='middle'
				className='-mt-5 h-full'
			>
				<Col className='w-full sm:max-w-[600px]'>
					{displayWeb === 2 ? (
						<Web2Login
							isModal={isModal}
							setLoginOpen={setLoginOpen}
							isDelegation={isDelegation}
							setSignupOpen={setSignupOpen}
							onWalletSelect={onWalletSelect}
							walletError={walletError}
							setWithPolkasafe={setWithPolkasafe}
						/>
					) : null}

					{displayWeb === 3 && chosenWallet && (
						<>
							{chosenWallet === Wallet.METAMASK ? (
								<MetamaskLogin
									isModal={isModal}
									setLoginOpen={setLoginOpen}
									setSignupOpen={setSignupOpen}
									setWalletError={setWalletError}
									setDisplayWeb2={setDisplayWeb2}
									chosenWallet={chosenWallet}
									onWalletUpdate={onWalletUpdate}
								/>
							) : chosenWallet == Wallet.WALLETCONNECT ? (
								<WalletConnectLogin
									isModal={isModal}
									setLoginOpen={setLoginOpen}
									setDisplayWeb2={setDisplayWeb2}
									setPolkadotWallet={setPolkadotWallet}
								/>
							) : (
								<Web3Login
									isModal={isModal}
									setLoginOpen={setLoginOpen}
									setSignupOpen={setSignupOpen}
									chosenWallet={chosenWallet}
									setDisplayWeb2={setDisplayWeb2}
									setWalletError={setWalletError}
									onWalletUpdate={onWalletUpdate}
									withPolkasafe={withPolkasafe}
									setChosenWallet={setChosenWallet}
								/>
							)}
						</>
					)}
				</Col>
			</Row>
		</>
	);
};

export default Login;
