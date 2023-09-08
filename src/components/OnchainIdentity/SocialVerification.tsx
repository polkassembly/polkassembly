// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Spin, Timeline, TimelineItemProps } from 'antd';
import styled from 'styled-components';
import { EmailIcon, TwitterIcon } from '~src/ui-components/CustomIcons';
import { ISocials } from '.';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import { IVerificationResponse } from 'pages/api/v1/verification';
import BN from 'bn.js';
import { useEffect, useState } from 'react';
import InprogressState from './InprogressState';
import VerifiedTick from '~assets/icons/verified-tick.svg';
import { useUserDetailsContext } from '~src/context';

export enum VerificationStatus {
	ALREADY_VERIFIED = 'Already verified',
	VERFICATION_EMAIL_SENT = 'Verification email sent',
	PLEASE_VERIFY_TWITTER = 'Please verify twitter'
}
interface Props{
  className?: string;
  socials: ISocials;
	setSocials: (pre: ISocials) =>void;
  address: string;
  startLoading: (pre: boolean) => void;
  onCancel:()=> void;
  changeStep: (pre: number) => void;
  closeModal: (pre: boolean) => void;
	setLoading: (pre: boolean) => void;
	perSocialBondFee: BN;
	identityHash: string;
}
interface ISocialLayout {
	title: string,
  description: string;
  value: string | null;
  onVerify: () => void;
	verified?: boolean;
	status?: VerificationStatus;
	loading: boolean;
}
interface IJudgementResponse {
	message?: string;
	hash?: string;
}
export enum ESocials {
	EMAIL = 'email',
	RIOT = 'riot',
	TWITTER = 'twitter',
	WEB = 'web'
}

const SocialsLayout = ({ title, description, value, onVerify, verified, status, loading }: ISocialLayout) => {
	return <Spin spinning={loading} className='-mt-4'>
		<div className='ml-2 text-lightBlue h-[70px] flex gap-5'>
		<span className='text-sm w-[60px] py-1.5'>{title}</span>
		<div className='w-full'>
			<div className={`border-solid border-[1px]  flex items-center justify-between border-[#D2D8E0] h-[40px] rounded-[4px] pl-3 pr-2 tracking-wide ${verified ? 'bg-[#f6f7f9] text-[#8d99a9]' :'text-bodyBlue bg-white' }`}>
				<span>{value}</span>
				{verified ? <span className='flex gap-2 items-center justify-center text-xs text-[#8d99a9]'><VerifiedTick/>Verified</span> :<Button
				onClick={onVerify}
				className={`bg-pink_primary border-none text-xs font-medium text-white h-[30px] tracking-wide rounded-[4px] ${status === VerificationStatus.VERFICATION_EMAIL_SENT ? 'w-[120px]': 'w-[68px]'}`}
				>{status === VerificationStatus.VERFICATION_EMAIL_SENT ? 'Check Verified' : 'Verify'}
					</Button>}
				</div>
				{!verified  && <span className='text-xs'>{description}</span>}
			</div>
		</div>
	</Spin>;
};

const SocialVerification = ({ className, socials, onCancel, setLoading, closeModal, changeStep, setSocials, address, identityHash }: Props) => {
	const { email, twitter } = socials;
	const [open, setOpen] = useState<boolean>(false);
	const [status, setStatus] = useState({ email: '', twitter: '' });
	const { id:userId } = useUserDetailsContext();
	const [ fieldLoading, setFieldLoading ] = useState< {twitter: boolean, email: boolean}>({ email: false, twitter: false });

	const items: TimelineItemProps[] = [];

	if(email?.value){
		items.push(
			{
				children: <SocialsLayout
						title='Email'
						description='Check your primary inbox or Spam to verify your email address.'
						onVerify={async() => await handleVerify(ESocials.EMAIL, status.email === VerificationStatus.VERFICATION_EMAIL_SENT ? true : false, true )}
						value={email?.value}
						verified={email?.verified}
						status={status?.email as VerificationStatus}
						loading={fieldLoading.email}
						/>,
			dot: <EmailIcon className={` ${email?.verified ? 'bg-[#51D36E] text-white': 'bg-[#edeff3] text-[#576D8B]' } rounded-full text-xl p-2.5 '`}/>,
			key: 1
				});
	}
 if(twitter?.value){
	items.push(
	{
		children: <SocialsLayout
						title='Twitter'
						description='Check your messages to verify your twitter username.'
						onVerify={async() => { await handleTwitterVerification();}}
						value={twitter?.value}
						verified={twitter?.verified}
						loading={fieldLoading.twitter}

						/>,
		dot: <TwitterIcon className='bg-[#edeff3] rounded-full text-xl p-2.5 text-[#576D8B]'/>,
		key: 2
	});
}
const handleLocalStorageSave = (field: any) => {

	let data: any = localStorage.getItem('identityForm');
	if(data){
		data = JSON.parse(data);
	}
	localStorage.setItem('identityForm', JSON.stringify({
	...data ,
	...field
	}));
};
const handleVerify =  async(fieldName: ESocials, checkingVerified?: boolean, isNotificaiton?: boolean ) => {
	setFieldLoading({ ...fieldLoading, [fieldName] : true });
	const { data, error } = await nextApiClientFetch<IVerificationResponse>(`api/v1/verification?type=${fieldName}&checkingVerified=${Boolean(checkingVerified)}`,{
	account: fieldName === ESocials.TWITTER ? socials?.[fieldName]?.value?.split('@')?.[1] : socials?.[fieldName]?.value,
	userId
	});

	if(data){
		console.log(data);
		if(data?.status === VerificationStatus.ALREADY_VERIFIED){
			fieldName === ESocials.EMAIL ? setStatus({ ...status,email: VerificationStatus?.ALREADY_VERIFIED }): setStatus({ ...status, twitter: VerificationStatus?.ALREADY_VERIFIED });
			setSocials({ ...socials, email: { ...email, verified: true } });
			handleLocalStorageSave({ email: { ...email, verified: true } });
			if(!checkingVerified){
				queueNotification({
					header: 'Verified!',
					message: data?.status,
					status: NotificationStatus.INFO
				});
			}
			setFieldLoading({ ...fieldLoading, [fieldName] : false });
		}else if(checkingVerified && data?.status === VerificationStatus.VERFICATION_EMAIL_SENT ){
			setFieldLoading({ ...fieldLoading, [fieldName] : false });
			setSocials({ ...socials, email: { ...email, verified: false } });
			handleLocalStorageSave({ email: { ...email, verified: false } });
		}
		else if((!checkingVerified || isNotificaiton)){
			setStatus({ ...status,email: VerificationStatus?.VERFICATION_EMAIL_SENT });
			queueNotification({
				header: 'Success!',
				message: 'Verification email sent successfully',
				status: NotificationStatus.SUCCESS
			});
			if(fieldName === ESocials.EMAIL){
				closeModal(true);
				setOpen(true);
			}
		}
		setFieldLoading({ ...fieldLoading, [fieldName] : false });
	}else
{
	console.log(error);
	setFieldLoading({ ...fieldLoading, [fieldName] : false });
}
// eslint-disable-next-line react-hooks/exhaustive-deps
};

const handleTwitterVerification = async() => {
	setLoading(true);
	const twitterHandle = socials?.[ESocials.TWITTER]?.value?.split('@')?.[1] || '';
	const { data, error } = await nextApiClientFetch<{url?: string}>(`api/v1/verification/twitter-verification?twitterHandle=${twitterHandle}`);

	if(data && data?.url){
	window.open(data?.url, '_blank');
}
else if(error){
	queueNotification({
		header: 'Error!',
		message: error,
		status: NotificationStatus.ERROR
	});
	console.log(error);
}
setLoading(false);
};

const handleJudgement = async() => {
	setLoading(true);
	const { data, error } = await nextApiClientFetch<IJudgementResponse>(`api/v1/verification/judgement-call?identityHash=${identityHash}&userAddress=${address}`);
	if(data){
	queueNotification({
		header: 'Success!',
		message: `Judgement call successfull with hash ${data?.hash || ''}`,
		status: NotificationStatus.SUCCESS
	});
	console.log(' Success', data?.hash);
	localStorage.removeItem('identityForm');
	localStorage.removeItem('identityAddress');
	localStorage.removeItem('identityWallet');
	setLoading(false);
}
else if(error){
	queueNotification({
		header: 'Error!',
		message: error,
		status: NotificationStatus.ERROR
	});
	setLoading(false);
	console.log(error);
}

};

useEffect(() => {
	(async() => {
	await handleVerify(ESocials.EMAIL, true);
	await handleVerify(ESocials.TWITTER, true);
	})();
// eslint-disable-next-line react-hooks/exhaustive-deps
},[]);
	return <div className={`${className} pl-4 border-white border-solid`}>
		<Timeline
		className='mt-8'
			items={ items }
		/>
		<div className='-mx-6 border-0 border-solid flex justify-end border-t-[1px] gap-4 px-6 pt-5 border-[#E1E6EB] rounded-[4px]'>
			<Button onClick={onCancel} className='border-pink_primary text-sm border-[1px] h-[40px] rounded-[4px] w-[134px] text-pink_primary tracking-wide'>
               Cancel
			</Button>
			<Button
			onClick={handleJudgement}
				className={`bg-pink_primary text-sm border-none rounded-[4px] h-[40px] w-[134px] text-white tracking-wide ${(!true) && 'opacity-50'}`}
			>
            Proceed
			</Button>
		</div>
		<InprogressState open={open} close={(close) => setOpen(!close)} openPreModal={(pre) => closeModal(!pre)} socials={socials} changeStep={changeStep} handleVerify={handleVerify}/>
	</div>;
};
export default styled(SocialVerification)`
.ant-timeline .ant-timeline-item-tail{
  border-inline-start: 2px solid rgba(5, 5, 5, 0) !important;
  background-image: linear-gradient(rgba(144,160,183) 33%, rgba(255,255,255,0) 0%) !important;
  background-position: right !important;
  background-size: 1.5px 7px !important;
  background-repeat: repeat-y !important ;
  cursor: pointer !important;
}
.ant-timeline .ant-timeline-item-content {
  inset-block-start: -12px;
`;