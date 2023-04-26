// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Col, Row, Skeleton } from 'antd';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import Web2Signup from 'src/components/Signup/Web2Signup';
import { Wallet } from 'src/types';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { useNetworkContext } from '~src/context';
import SEOHead from '~src/global/SEOHead';

const WalletConnectSignup = dynamic(() => import('src/components/Signup/WalletConnectSignup'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});
const Web3Signup = dynamic(() => import('src/components/Signup/Web3Signup'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});
const MetamaskSignup = dynamic(() => import('src/components/Signup/MetamaskSignup'), {
	loading: () => <Skeleton active /> ,
	ssr: false
});

interface Props{
	network:string;
	isModal?:boolean;
	setLoginOpen?:(pre:boolean)=>void;
	setSignupOpen?:(pre:boolean)=>void;
}
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);
	return { props: { network } };
};

const Signup = ({ network,isModal,setLoginOpen,setSignupOpen }:Props) => {
	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [displayWeb, setDisplayWeb] = useState(2);
	const [chosenWallet, setChosenWallet] = useState<Wallet>();
	const [walletError, setWalletError] =  useState<string | undefined>();

	const setDisplayWeb2 = () => setDisplayWeb(2);

	const onWalletSelect = (wallet: Wallet) => {
		setChosenWallet(wallet);
		setDisplayWeb(3);
	};
	const [method, setMethod] = useState('');

	useEffect(() => {
		if(!method) return;

		if(method === 'web2') {
			setDisplayWeb2();
		}else if(method === 'polkadotjs') {
			onWalletSelect(Wallet.POLKADOT);
		}
	}, [method]);

	return (
		<>
			<SEOHead title="Signup" network={network}/>
			<Row justify='center' align='middle' className='h-full -mt-5'>
				<Col className='w-full sm:max-w-[600px]'>
					{ displayWeb === 2
						? <Web2Signup  isModal={isModal} setLoginOpen={setLoginOpen} setSignupOpen={setSignupOpen} onWalletSelect={onWalletSelect} walletError={walletError} /> : null}

					{
						displayWeb === 3 && chosenWallet && <>
							{
								chosenWallet === Wallet.METAMASK ?
									<MetamaskSignup isModal={isModal} setSignupOpen={setSignupOpen} setWalletError={setWalletError} setDisplayWeb2={setDisplayWeb2} chosenWallet={chosenWallet}/>
									: chosenWallet == Wallet.WALLETCONNECT ?
										<WalletConnectSignup  isModal={isModal} setSignupOpen={setSignupOpen} setMethod={setMethod}/> :
										<Web3Signup
											isModal={isModal}
											setSignupOpen={setSignupOpen}
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

export default Signup;
