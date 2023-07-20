// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Alert, Button, Spin, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { EEnactment, IEnactment } from '.';
import BN from 'bn.js';
import Address from '~src/ui-components/Address';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { useApiContext, useNetworkContext, useUserDetailsContext } from '~src/context';
import { BN_HUNDRED, formatBalance } from '@polkadot/util';
import { chainProperties } from '~src/global/networkConstants';
import { formatedBalance } from '../DelegationDashboard/ProfileBalance';
import copyToClipboard from '~src/util/copyToClipboard';
import CopyIcon from '~assets/icons/content-copy.svg';
import { LoadingOutlined } from '@ant-design/icons';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import { Injected, InjectedWindow } from '@polkadot/extension-inject/types';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { APPNAME } from '~src/global/appName';
import styled from 'styled-components';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { CreatePostResponseType } from '~src/auth/types';
import { poppins } from 'pages/_app';
import executeTx from '~src/util/executeTx';

const ZERO_BN = new BN(0);

interface Props{
  className?: string;
  isPreimage: boolean;
  proposerAddress: string;
  fundingAmount: BN;
  selectedTrack: string;
  preimageHash: string;
  preimageLength: number | null;
  enactment: IEnactment;
  beneficiaryAddress: string;
  setOpenModal: (pre: boolean) => void;
  setOpenSuccess: (pre: boolean) => void;
  title: string;
  content: string;
  tags: string[];
  postId: number;
  setPostId: (pre: number) => void;
}

const CreateProposal = ({ className, isPreimage, fundingAmount, proposerAddress, selectedTrack, preimageHash, preimageLength, enactment, beneficiaryAddress, setOpenModal, setOpenSuccess,title, content, tags, setPostId }: Props) => {
	const { network } = useNetworkContext();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [messageApi, contextHolder] = message.useMessage();
	const { api, apiReady } = useApiContext();
	const [txFee, setTxFee] = useState(ZERO_BN);
	const [submitionDeposite, setSubmissionDeposite] = useState<BN>(ZERO_BN);
	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const { id: userId } = useUserDetailsContext();

	const success = (message: string) => {
		messageApi.open({
			content: message,
			duration: 10,
			type: 'success'
		});
	};
	const copyLink = (address:string) => {
		copyToClipboard(address);
	};

	useEffect(() => {

		if(!network) return ;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit
		});

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setShowAlert(false);
		setLoading(true);
		const obj = localStorage.getItem('treasuryProposalData');
		obj && localStorage.setItem('treasuryProposalData', JSON.stringify({ ...JSON.parse(obj), step: 2 }));

		if(!proposerAddress || !api || !apiReady || !fundingAmount || fundingAmount.lte(ZERO_BN) || fundingAmount.eq(ZERO_BN)) return;
		if(selectedTrack.length === 0 ) return;

		const origin: any = { Origins: selectedTrack };
		setLoading(true);
		const tx = api.tx.referenda.submit(origin ,{ Lookup: { hash: preimageHash, len: String(preimageLength) } }, enactment.value ? (enactment.key === EEnactment.At_Block_No ? { At: enactment.value }: { After: enactment.value }): { After: BN_HUNDRED });
		(async () => {
			const info = await tx.paymentInfo(proposerAddress);
			setTxFee(new BN(info.partialFee.toString() || 0));
			setLoading(false);
			setShowAlert(true);
		})();
		const submissionDeposite = api.consts.referenda.submissionDeposit;
		setSubmissionDeposite(submissionDeposite);
		setLoading(false);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [proposerAddress, beneficiaryAddress, fundingAmount, api, apiReady, network, selectedTrack, preimageHash, preimageLength, enactment.value, enactment.key]);

	const handleSaveTreasuryProposal = async(postId: number) => {
		const { data, error: apiError } = await nextApiClientFetch<CreatePostResponseType>('api/v1/auth/action/createOpengovTreasuryProposal',{
			content,
			postId : postId,
			proposerAddress,
			tags,
			title,
			userId
		});

		if(data && data?.post_id){
			setPostId(data?.post_id);
		}
		else if(apiError || !data?.post_id) {
			queueNotification({
				header: 'Error',
				message: 'There was an error creating your treasury post.',
				status: NotificationStatus.ERROR
			});
			console.error(apiError);
		}

	};

	const handleSubmitTreasuryProposal = async() => {
		if(!api || !apiReady) return;
		const origin: any = { Origins: selectedTrack };
		const proposerWallet = localStorage.getItem('treasuryProposalProposerWallet') || '';

		const injectedWindow = window as Window & InjectedWindow;
		const wallet = isWeb3Injected
			? injectedWindow.injectedWeb3[String(proposerWallet)]
			: null;

		if (!wallet) {
			return;
		}

		let injected: Injected | undefined;

		try {
			injected = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('Wallet Timeout'));
				}, 60000); // wait 60 sec
				if(wallet && wallet.enable) {
					wallet.enable(APPNAME)
						.then((value) => { clearTimeout(timeoutId); resolve(value); })
						.catch((error) => { reject(error); });
				}
			});
		} catch (err) {
			console.log(err?.message);
		}
		if (!injected) {
			return;
		}
		api.setSigner(injected.signer);

		setLoading(true);
		try {
			setLoading(true);
			const proposal = api.tx.referenda.submit(origin ,{ Lookup: { hash: preimageHash, len: String(preimageLength) } }, enactment.value ? (enactment.key === EEnactment.At_Block_No ? { At: enactment.value }: { After: enactment.value }): { After: BN_HUNDRED });

			const onSuccess = async() => {
				queueNotification({
					header: 'Success!',
					message: `Proposal #${proposal.hash} successful.`,
					status: NotificationStatus.SUCCESS
				});
				setLoading(false);
				const post_id = Number(api.query.referenda.referendumCount()) - 1;
				await handleSaveTreasuryProposal(post_id);
				setLoading(false);
				setOpenSuccess(true);
				setOpenModal(false);
			};

			const onFailed = () => {
				queueNotification({
					header: 'Failed!',
					message: 'Transaction failed!',
					status: NotificationStatus.ERROR
				});
				setLoading(false);
			};
			await executeTx({ address: proposerAddress, api, errorMessageFallback: 'failed.', network, onFailed, onSuccess, tx: proposal });

		}
		catch(error){
			setLoading(false);
			console.log(':( transaction failed');
			console.error('ERROR:', error);
			queueNotification({
				header: 'Failed!',
				message: error.message,
				status: NotificationStatus.ERROR
			});
		}
	};
	return <Spin spinning={loading} indicator={<LoadingOutlined/>}>
		<div className={`create-proposal ${className}`}>
			<Alert message={`Preimage ${isPreimage ? 'linked' : 'created'} successfully`} className={`text-bodyBlue text-sm rounded-[4px] mt-8 ${poppins.variable} ${poppins.className}`} type='success' showIcon/>
			<div className='mt-4 text-sm font-normal text-lightBlue'>
				<label className='font-medium'>Preimage Details:</label>
				<div className='mt-[10px] flex flex-col gap-2'>
					<span className='flex'><span className='w-[150px]'>Proposer Address:</span><Address address={proposerAddress} identiconSize={24}/></span>
					<span className='flex'><span className='w-[150px]'>Track:</span><span className='text-bodyBlue font-medium'>{selectedTrack} <span className='text-pink_primary'>#{networkTrackInfo[network][selectedTrack]?.trackId || 0}</span></span></span>
					<span className='flex'><span className='w-[150px]'>Funding Amount:</span><span className='text-bodyBlue font-medium'>{formatedBalance(fundingAmount.toString(), unit)} {unit}</span></span>
					<span className='flex items-center'><span className='w-[150px]'>Preimage Hash:</span>
						<span className='text-bodyBlue  font-medium'>{preimageHash.slice(0,10)+'...'+ preimageHash.slice(55)}</span>
						<span className='flex items-center cursor-pointer' onClick={(e) => {e.preventDefault(); copyLink(preimageHash) ;success('Preimage hash copied to clipboard');}}>
							{contextHolder}
							<CopyIcon/>
						</span>
					</span>
					<span className='flex'><span className='w-[150px]'>Preimage Length:</span><span className='text-bodyBlue font-medium'>{preimageLength}</span></span>
					<span className='flex items-center'>
						<span className='w-[150px]'>Preimage Link:</span>
						<a target='_blank' rel='noreferrer' href={`https://${network}.polkassembly.io/preimages/${preimageHash}`} className='text-bodyBlue font-medium'>{`https://${network}.polkassembly.io/preimages/${preimageHash.slice(0,5)}...`}</a>
						<span className='flex items-center cursor-pointer' onClick={(e) => {e.preventDefault(); copyLink(`https://${network}.polkassembly.io/preimages/${preimageHash}`) ;success('Preimage link copied to clipboard.');}}>
							{contextHolder}
							<CopyIcon/>
						</span>
					</span>
				</div>
			</div>
			{showAlert && <Alert className={`mt-6 text-bodyBlue rounded-[4px] ${poppins.className} ${poppins.variable}`} showIcon type='info' message={<span className='text-sm text-bodyBlue'>An amount of <span className='font-medium'>{formatedBalance(String(txFee.add(submitionDeposite).toString()), unit)} {unit}</span> will be required to submit proposal.</span>}
				description={<div className='mt-[10px] flex flex-col gap-1 font-normal'>
					<span className='flex gap-3 text-xs text-lightBlue'><span className='w-[150px]'>Deposit amount</span><span className='text-bodyBlue font-medium'>{formatedBalance(String(submitionDeposite.toString()), unit)} {unit}</span></span>
					<span className='flex gap-3 text-xs text-lightBlue'><span className='w-[150px]'>Gas fees</span><span className='text-bodyBlue font-medium'>{formatedBalance(String(txFee.toString()), unit)} {unit}</span></span>
					<span className='flex gap-3 text-sm text-lightBlue font-semibold'><span className='w-[150px]'>Total</span><span className='text-bodyBlue'>{formatedBalance(String(txFee.add(submitionDeposite).toString()), unit)} {unit}</span></span>
				</div>}/>}
			<div className='flex justify-end mt-6 -mx-6 border-0 border-solid border-t-[1px] border-[#D2D8E0] px-6 pt-4 gap-4'>
				<Button onClick={() => handleSubmitTreasuryProposal() } className='bg-pink_primary text-white font-medium tracking-[0.05em] text-sm w-[155px] h-[40px] rounded-[4px]'>
         Create Proposal
				</Button>
			</div>
		</div>
	</Spin>;
};
export default styled(CreateProposal)`
.ant-alert-with-description{
padding-block: 15px !important;
}
.ant-alert-with-description .ant-alert-icon{
  font-size: 18px !important;
  margin-top: 4px;
}`;