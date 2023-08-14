// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useContext, useEffect, useState } from 'react';
import { Button, Modal, Spin } from 'antd';
import { poppins } from 'pages/_app';
import { NetworkContext } from '~src/context/NetworkContext';
import { ApiContext } from '~src/context/ApiContext';
import BN from 'bn.js';
import { LoadingOutlined } from '@ant-design/icons';
import { chainProperties } from '~src/global/networkConstants';
import { formatBalance } from '@polkadot/util';
import TotalAmountBreakdown from './TotalAmountBreakdown';
import CloseIcon from '~assets/icons/close-icon.svg';
import OnChainIdentityIcon from '~assets/icons/onchain-identity.svg';
import IdentityForm from './IdentityForm';
import SocialVerification from './SocialVerification';
// import VerificationSuccessScreen from './VerificationSuccessScreen';

const ZERO_BN = new BN(0);

export interface ITxFee {
  bondFee: BN;
  gasFee: BN;
  registerarFee: BN;
}

export interface IName {
  legalName: string;
  displayName: string;
}

export interface ISocials{
  web: string;
  email: string;
  twitter: string;
  riot: string;
}
const OnChainIdentity = () => {

	const [open, setOpen] = useState<boolean>(false);
	const [title, setTitle] = useState<string>('On-chain identity');
	const { network } = useContext(NetworkContext);
	const { api, apiReady } = useContext(ApiContext);
	const [loading, setLoading]= useState<boolean>(false);
	const [txFee, setTxFee] = useState<ITxFee>({ bondFee: ZERO_BN, gasFee: ZERO_BN, registerarFee: ZERO_BN });
	const [step, setStep] = useState<number>(1);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [address, setAddress] = useState<string>('5GBnMKKUHNbN2fqBY4NbwMMNNieJLYHjr3p9J5W9i1nxKk8e');
	const [name, setName] = useState<IName>({ displayName: '', legalName: '' });
	const [socials, setSocials] = useState<ISocials>({ email: '', riot: '', twitter: '', web: '' });
	const [perSocialBondFee, setPerSocialBondFee] = useState<BN>(ZERO_BN);

	useEffect(() => {
		if(!network) return ;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		if(!api || !apiReady) return;
		setLoading(true);

		(async() => {

			const bondFee = api.consts.identity.fieldDeposit;

			const registerarFee:any = await api.query.identity.registrars().then((e) => JSON.parse(e.toString()));
			const bnRegisterarFee = new BN((registerarFee[registerarFee.length -1].fee) || ZERO_BN);
			setTxFee({ ... txFee, bondFee: ZERO_BN, registerarFee: bnRegisterarFee });
			setPerSocialBondFee(bondFee);
			setLoading(false);

		})();

	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[api, apiReady, network]);

	const handleCancel = () => {
		setOpen(false);
		setStep(1);
	};

	useEffect(() => {
		step === 3 && setTitle('Socials Verification');
	},[step]);

	return<>
		<Button onClick={() => setOpen(true)} className='text-pink_primary text-sm text-semibold border-pink_primary'>Set OnChainIdentity</Button>
		<Modal
			footer={false}
			open={open}
			onCancel={handleCancel}
			closeIcon={<CloseIcon/>}
			className={`${poppins.className} ${poppins.variable} w-[600px] max-sm:w-full`}
			title={<span className='-mx-6 px-6 border-0 border-solid border-b-[1px] border-[#E1E6EB] pb-3 flex items-center gap-2 text-xl font-semibold'><OnChainIdentityIcon/><span>{title}</span></span>}
		>
			<Spin spinning={loading} indicator={<LoadingOutlined/>}>
				{step === 1 && <TotalAmountBreakdown txFee={txFee} perSocialBondFee={perSocialBondFee} changeStep={setStep}/>}
				{step === 2 && <IdentityForm
					className= 'mt-3'
					txFee= {txFee}
					name= {name}
					onChangeName= {setName}
					socials= {socials}
					onChangeSocials= {setSocials}
					address= {address}
					setTxFee= {setTxFee}
					startLoading= {setLoading}
					onCancel= {handleCancel}
					perSocialBondFee= {perSocialBondFee}
					changeStep= {setStep}
					closeModal= {(open) => setOpen(!open)}
				/>}
				{step === 3 && <SocialVerification
					socials= {socials}
					address= {address}
					startLoading= {setLoading}
					onCancel= {handleCancel}
					perSocialBondFee= {perSocialBondFee}
					changeStep= {setStep}
					closeModal= {(open) => setOpen(!open)}
          />
          }
				{/* <VerificationSuccessScreen open={true} social='Twitter' socialHandle='@Kanishkadj' /> */}
			</Spin>

		</Modal>
	</>
	;
};

export default OnChainIdentity;