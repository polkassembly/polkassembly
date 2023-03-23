// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Col, Row, Skeleton } from 'antd';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Web2Login from 'src/components/Login/Web2Login';
import { useNetworkContext, useUserDetailsContext } from 'src/context';
import { Wallet } from 'src/types';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import SEOHead from '~src/global/SEOHead';
// import useHandleMetaMask from '~src/hooks/useHandleMetaMask';

interface Props{
	network:string;
	isModal:boolean;
	setLoginOpen:(pre:boolean)=>void;
	setSignupOpen:(pre:boolean)=>void;
}

const Web3Login = dynamic(() => import('src/components/Login/Web3Login'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});
const MetamaskLogin = dynamic(() => import('src/components/Login/MetamaskLogin'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});
const WalletConnectLogin = dynamic(() => import('src/components/Login/WalletConnectLogin'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);
	return { props: { network } };
};

const Login = ({ network,setLoginOpen,setSignupOpen,isModal }:Props) => {
	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const currentUser = useUserDetailsContext();
	const router = useRouter();
	const [displayWeb, setDisplayWeb] = useState(2);
	const [chosenWallet, setChosenWallet] = useState<Wallet>();
	const [walletError, setWalletError] =  useState<string | undefined>();

	const setDisplayWeb2 = () => setDisplayWeb(2);

	const onWalletSelect = (wallet: Wallet) => {
		setChosenWallet(wallet);
		setDisplayWeb(3);
	};

	const setPolkadotWallet = () => {
		onWalletSelect(Wallet.POLKADOT);
	};

	useEffect(() => {
		if (currentUser?.id && !isModal) {
			router.push('/');
		}
	},[currentUser?.id, router]);
	return (
		<>
			<SEOHead title="Login" />
			<Row justify='center' align='middle' className='h-full -mt-5'>
				<Col className='w-full sm:max-w-[600px]'>
					{displayWeb === 2 ? (
						<Web2Login  isModal={isModal} setLoginOpen={setLoginOpen} setSignupOpen={setSignupOpen}  onWalletSelect={onWalletSelect} walletError={walletError} />
					) : null}

					{
						displayWeb === 3 && chosenWallet && <>
							{
								chosenWallet === Wallet.METAMASK ?
									<MetamaskLogin setWalletError={setWalletError} setDisplayWeb2={setDisplayWeb2} chosenWallet={chosenWallet}/>
									: chosenWallet == Wallet.WALLETCONNECT ?
										<WalletConnectLogin setDisplayWeb2={setDisplayWeb2} setPolkadotWallet={setPolkadotWallet} /> :
										<Web3Login
											chosenWallet={chosenWallet}
											setDisplayWeb2={setDisplayWeb2}
											setWalletError={setWalletError}
										/>
							}
						</>
					}
				</Col>
			</Row>
		</>
	);
};

export default Login;