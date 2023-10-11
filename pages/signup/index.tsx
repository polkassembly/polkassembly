// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Col, Row, Skeleton } from 'antd';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Web2Signup from 'src/components/Signup/Web2Signup';
import { Wallet } from 'src/types';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

const WalletConnectSignup = dynamic(() => import('src/components/Signup/WalletConnectSignup'), {
	loading: () => <Skeleton active />,
	ssr: false
});
const Web3Signup = dynamic(() => import('src/components/Signup/Web3Signup'), {
	loading: () => <Skeleton active />,
	ssr: false
});
const MetamaskSignup = dynamic(() => import('src/components/Signup/MetamaskSignup'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface Props {
	network: string;
	isModal?: boolean;
	setLoginOpen?: (pre: boolean) => void;
	setSignupOpen?: (pre: boolean) => void;
	isDelegation?: boolean;
}
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	return { props: { network } };
};

const Signup = ({ network, isModal, setLoginOpen, setSignupOpen, isDelegation }: Props) => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [displayWeb, setDisplayWeb] = useState(2);
	const [chosenWallet, setChosenWallet] = useState<Wallet | null>(null);
	const [walletError, setWalletError] = useState<string | undefined>();
	const [withPolkasafe, setWithPolkasafe] = useState<boolean>(false);
	const [method, setMethod] = useState('');

	const setDisplayWeb2 = () => setDisplayWeb(2);

	const onWalletSelect = (wallet: Wallet) => {
		setChosenWallet(wallet);
		setDisplayWeb(3);
	};

	const onWalletUpdate = () => {
		setChosenWallet(null);
		setWithPolkasafe(false);
		setDisplayWeb(2);
	};

	useEffect(() => {
		if (!method) return;

		if (method === 'web2') {
			setDisplayWeb2();
		} else if (method === 'polkadotjs') {
			onWalletSelect(Wallet.POLKADOT);
		}
	}, [method]);

	return (
		<>
			<SEOHead
				title='Signup'
				network={network}
			/>
			<Row
				justify='center'
				align='middle'
				className='-mt-5 h-full'
			>
				<Col className='w-full sm:max-w-[600px]'>
					{displayWeb === 2 ? (
						<Web2Signup
							isDelegation={isDelegation}
							isModal={isModal}
							setLoginOpen={setLoginOpen}
							setSignupOpen={setSignupOpen}
							onWalletSelect={onWalletSelect}
							walletError={walletError}
							setWithPolkasafe={setWithPolkasafe}
						/>
					) : null}

					{displayWeb === 3 && chosenWallet && (
						<>
							{chosenWallet === Wallet.METAMASK ? (
								<MetamaskSignup
									isModal={isModal}
									setSignupOpen={setSignupOpen}
									setLoginOpen={setLoginOpen}
									setWalletError={setWalletError}
									setDisplayWeb2={setDisplayWeb2}
									chosenWallet={chosenWallet}
								/>
							) : chosenWallet == Wallet.WALLETCONNECT ? (
								<WalletConnectSignup
									isModal={isModal}
									setSignupOpen={setSignupOpen}
									setMethod={setMethod}
								/>
							) : (
								<Web3Signup
									isModal={isModal}
									setSignupOpen={setSignupOpen}
									setLoginOpen={setLoginOpen}
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

export default Signup;
