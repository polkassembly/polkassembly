// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useEffect, useState } from 'react';
import { Timeline, TimelineItemProps } from 'antd';
import styled from 'styled-components';
import { EmailIcon, TwitterIcon } from '~src/ui-components/CustomIcons';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import queueNotification from '~src/ui-components/QueueNotification';
import { ESocials, NotificationStatus, VerificationStatus } from '~src/types';
import { IVerificationResponse } from 'pages/api/v1/verification';
import { useRouter } from 'next/router';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { ESetIdentitySteps, IIdentitySocialVerifications, IJudgementResponse } from './types';
import SocialsLayout from './SocialLayout';
import { useNetworkSelector, useOnchainIdentitySelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { onchainIdentityActions } from '~src/redux/onchainIdentity';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import SocialVerificationInprogress from './SocialVerificationInprogress';
import Image from 'next/image';
import { useApiContext, usePeopleKusamaApiContext } from '~src/context';
import { ApiPromise } from '@polkadot/api';
import messages from '~src/auth/utils/messages';

const SocialVerification = ({ className, onCancel, startLoading, closeModal, setOpenSuccessModal, changeStep }: IIdentitySocialVerifications) => {
	const dispach = useDispatch();
	const { network } = useNetworkSelector();
	const { api: defaultApi, apiReady: defaultApiReady } = useApiContext();
	const { peopleKusamaApi, peopleKusamaApiReady } = usePeopleKusamaApiContext();
	const [{ api, apiReady }, setApiDetails] = useState<{ api: ApiPromise | null; apiReady: boolean }>({ api: defaultApi || null, apiReady: defaultApiReady || false });
	const { socials, identityAddress, identityHash } = useOnchainIdentitySelector();
	const { email, twitter } = socials;
	const [open, setOpen] = useState<boolean>(false);
	const [status, setStatus] = useState({ email: '', twitter: '' });
	const [fieldLoading, setFieldLoading] = useState<{ twitter: boolean; email: boolean }>({ email: false, twitter: false });
	const [twitterVerificationStart, setTwitterVerificationStart] = useState<boolean>(false);
	const router = useRouter();

	const items: TimelineItemProps[] = [];

	useEffect(() => {
		if (network === 'kusama') {
			setApiDetails({ api: peopleKusamaApi || null, apiReady: peopleKusamaApiReady });
		} else {
			setApiDetails({ api: defaultApi || null, apiReady: defaultApiReady || false });
		}
	}, [network, peopleKusamaApi, peopleKusamaApiReady, defaultApi, defaultApiReady]);

	const handleTwitterVerificationClick = async () => {
		if (twitterVerificationStart) {
			await handleVerify(ESocials.TWITTER, true);
		} else {
			setTwitterVerificationStart(true);
			await handleTwitterVerification();
		}
	};
	if (email?.value.length) {
		items.push({
			children: (
				<SocialsLayout
					title='Email'
					description='Check your primary inbox or spam to verify your email address.'
					onVerify={async () => await handleVerify(ESocials.EMAIL, status.email === VerificationStatus.VERFICATION_EMAIL_SENT ? true : false)}
					value={email?.value}
					verified={email?.verified}
					status={status?.email as VerificationStatus}
					loading={fieldLoading.email}
				/>
			),
			dot: <EmailIcon className={`${email?.verified ? 'bg-[#51D36E] text-white' : 'bg-[#edeff3] text-[#576D8B] dark:bg-section-dark-container'} ' rounded-full p-2.5 text-xl`} />,
			key: 1
		});
	}
	if (twitter?.value.length) {
		items.push({
			children: (
				<SocialsLayout
					title='Twitter'
					description='Please login to Twitter to verify your email address.'
					onVerify={handleTwitterVerificationClick}
					value={twitter?.value}
					verified={twitter?.verified}
					status={twitterVerificationStart ? VerificationStatus.PLEASE_VERIFY_TWITTER : (status?.twitter as VerificationStatus)}
					loading={fieldLoading.twitter}
					fieldName={ESocials.TWITTER}
				/>
			),
			dot: (
				<TwitterIcon className={` ${twitter?.verified ? 'bg-[#51D36E] text-white' : 'bg-[#edeff3] text-[#576D8B] dark:bg-section-dark-container'} ' rounded-full p-2.5 text-xl`} />
			),
			key: 2
		});
	}
	const handleNewStateUpdation = (field: any, socialsChanging?: boolean) => {
		const newData = { ...email, ...field };

		if (socialsChanging) {
			dispach(
				onchainIdentityActions.setOnchainSocials({
					...socials,
					email: { ...email, ...newData?.email },
					twitter: { ...twitter, ...newData?.twitter }
				})
			);
		}
	};

	const handleSetStates = (fieldName: ESocials, verifiedField: boolean, verificationStatus: VerificationStatus, noStatusUpdate?: boolean) => {
		if (ESocials.EMAIL === fieldName) {
			!noStatusUpdate && setStatus({ ...status, email: verificationStatus });
			handleNewStateUpdation({ email: { ...email, verified: verifiedField } }, true);
		} else {
			!noStatusUpdate && setStatus({ ...status, twitter: verificationStatus });
			handleNewStateUpdation({ twitter: { ...twitter, verified: verifiedField } }, true);
		}
	};

	const handleVerify = async (fieldName: ESocials, checkingVerified?: boolean) => {
		const account = fieldName === ESocials.TWITTER ? socials?.[fieldName]?.value?.split('@')?.[1] || socials?.[fieldName]?.value : socials?.[fieldName]?.value;

		if (!checkingVerified) {
			setFieldLoading({ ...fieldLoading, [fieldName]: true });
		} else {
			startLoading({ isLoading: true, message: '' });
		}

		const { data, error } = await nextApiClientFetch<IVerificationResponse>('api/v1/verification', {
			account,
			checkingVerified: Boolean(checkingVerified),
			type: fieldName
		});

		if (error) {
			handleSetStates(fieldName, false, VerificationStatus.NOT_VERIFIED, false);
			setFieldLoading({ ...fieldLoading, [fieldName]: false });
			startLoading({ isLoading: false, message: '' });
			console.log(error);
			if (error === messages.INVALID_JWT)
				queueNotification({
					header: 'Error!',
					message: error,
					status: NotificationStatus.ERROR
				});
		}
		if (data) {
			if (data?.message === VerificationStatus.ALREADY_VERIFIED) {
				handleSetStates(fieldName, true, VerificationStatus.ALREADY_VERIFIED);
				setFieldLoading({ ...fieldLoading, [fieldName]: false });
			} else if (checkingVerified && data?.message === VerificationStatus.VERFICATION_EMAIL_SENT) {
				setFieldLoading({ ...fieldLoading, [fieldName]: false });
				if (ESocials.EMAIL === fieldName) {
					handleSetStates(fieldName, false, VerificationStatus.VERFICATION_EMAIL_SENT);
				} else if (ESocials.TWITTER === fieldName) {
					handleSetStates(fieldName, false, VerificationStatus.PLEASE_VERIFY_TWITTER);
				}
			} else if (checkingVerified && data?.message === VerificationStatus.NOT_VERIFIED) {
				setStatus({ ...status, email: VerificationStatus.NOT_VERIFIED });
			} else if (!checkingVerified) {
				if (fieldName === ESocials.EMAIL) {
					if (data?.message === VerificationStatus.VERFICATION_EMAIL_SENT) {
						closeModal(true);
						setOpen(true);
						setStatus({ ...status, email: VerificationStatus?.VERFICATION_EMAIL_SENT });
					} else {
						setStatus({ ...status, email: VerificationStatus.NOT_VERIFIED });
					}
				}
			}
			setFieldLoading({ ...fieldLoading, [fieldName]: false });
		}

		startLoading({ isLoading: false, message: '' });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	};

	const handleTwitterVerification = async () => {
		startLoading({ isLoading: true, message: '' });
		const twitterHandle = socials?.twitter?.value?.split('@')?.[1] || socials?.twitter?.value;
		const { data, error } = await nextApiClientFetch<{ url?: string }>(`api/v1/verification/twitter-verification?twitterHandle=${twitterHandle}`);

		if (data && data?.url) {
			window.open(data?.url, '_blank');
		} else if (error) {
			queueNotification({
				header: 'Error!',
				message: error,
				status: NotificationStatus.ERROR
			});
			console.log(error);
		}
		startLoading({ isLoading: false, message: '' });
	};

	const handleJudgement = async () => {
		startLoading({ isLoading: true, message: 'Awaiting Judgement from Polkassembly' });
		const { data, error } = await nextApiClientFetch<IJudgementResponse>('api/v1/verification/judgement-call', {
			identityHash,
			userAddress: identityAddress
		});

		if (data) {
			setOpenSuccessModal(true);
			closeModal(true);
			startLoading({ isLoading: false, message: '' });
			localStorage.removeItem('identityAddress');
			localStorage.removeItem('identityWallet');
			changeStep(ESetIdentitySteps.AMOUNT_BREAKDOWN);
			router.replace(isOpenGovSupported(network) ? '/opengov' : '/').finally(() => {
				router.reload();
			});
		} else if (error) {
			queueNotification({
				header: 'Error!',
				message: error,
				status: NotificationStatus.ERROR
			});
			startLoading({ isLoading: false, message: '' });
			console.log(error);
		}
	};

	useEffect(() => {
		if (twitter.value.length) {
			(async () => {
				await handleVerify(ESocials.TWITTER, true);
			})();
		}
		(async () => {
			await handleVerify(ESocials.EMAIL, true);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	const handleProceedDisabled = () => {
		let socialsCount = 0;
		let verifiedCount = 0;
		Object?.values(socials).forEach((value) => {
			if (value?.value?.length) {
				socialsCount += 1;
			}
			if (value?.verified) {
				verifiedCount += 1;
			}
		});

		return socialsCount !== verifiedCount;
	};

	return (
		<div className={`${className} border-solid border-white pl-4 dark:border-transparent`}>
			<Timeline
				className='mt-8'
				items={items}
			/>

			<div className='-ml-4 mb-4 flex w-full items-center justify-start gap-1 text-xs text-lightBlue dark:text-blue-dark-medium'>
				Regarding any query Contact us
				<a href='mailto:hello@polkassembly.io'>
					<Image
						width={16}
						height={16}
						src='/assets/icons/redirect.svg'
						alt=''
					/>
				</a>
			</div>
			<div className='-ml-10 -mr-6 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-[#E1E6EB] px-6 pt-5 dark:border-separatorDark'>
				<CustomButton
					text='Cancel'
					onClick={onCancel}
					buttonsize='xs'
					variant='default'
				/>
				<CustomButton
					text='Proceed'
					onClick={handleJudgement}
					disabled={handleProceedDisabled()}
					buttonsize='xs'
					variant='primary'
					className={handleProceedDisabled() ? 'opacity-50' : ''}
				/>
			</div>
			<SocialVerificationInprogress
				open={open}
				close={(close: boolean) => setOpen(!close)}
				openPreModal={(pre: boolean) => closeModal(!pre)}
				handleVerify={handleVerify}
				changeStep={changeStep}
			/>
		</div>
	);
};
export default styled(SocialVerification)`
	.ant-timeline .ant-timeline-item-tail {
		border-inline-start: 2px solid rgba(5, 5, 5, 0) !important;
		background-image: linear-gradient(rgba(144, 160, 183) 33%, rgba(255, 255, 255, 0) 0%) !important;
		background-position: right !important;
		background-size: 1.5px 7px !important;
		background-repeat: repeat-y !important ;
		cursor: pointer !important;
	}
	.ant-timeline .ant-timeline-item-content {
		inset-block-start: -12px;
	}
	.ant-timeline .ant-timeline-item-head {
		background-color: transparent !important;
	}
`;
