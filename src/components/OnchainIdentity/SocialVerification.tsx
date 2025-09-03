// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useEffect, useRef, useState } from 'react';
import { message, Timeline, TimelineItemProps, Tooltip } from 'antd';
import styled from 'styled-components';
import { CopyIcon, EmailIcon, MatrixIcon, TwitterIcon } from '~src/ui-components/CustomIcons';
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
import messages from '~src/auth/utils/messages';
import { MessageType } from '~src/auth/types';
import copyToClipboard from '~src/util/copyToClipboard';

const SocialVerification = ({ className, onCancel, startLoading, closeModal, setOpenSuccessModal, changeStep }: IIdentitySocialVerifications) => {
	const dispach = useDispatch();
	const { network } = useNetworkSelector();
	const { socials, identityAddress, identityHash } = useOnchainIdentitySelector();
	const { email, twitter, matrix } = socials;
	const [open, setOpen] = useState<boolean>(false);
	const [status, setStatus] = useState({ email: '', matrix: '', twitter: '' });
	const [fieldLoading, setFieldLoading] = useState<{ twitter: boolean; email: boolean; matrix: boolean }>({ email: false, matrix: false, twitter: false });
	const [twitterVerificationStart, setTwitterVerificationStart] = useState<boolean>(false);
	const router = useRouter();
	const isEmailVerified = useRef(false);
	const isTwitterVerified = useRef(false);
	const isMatrixVerified = useRef(false);
	const [messageApi, contextHolder] = message.useMessage();
	const [matrixDisplayName, setMatrixDisplayname] = useState<string>('');

	const success = (msg: string) => {
		messageApi.open({
			content: msg,
			duration: 10,
			type: 'success'
		});
	};

	const items: TimelineItemProps[] = [];

	const handleUpdatedUserName = () => {
		if (!matrixDisplayName?.length || !identityAddress) return '';
		const updatedUsername = `${matrixDisplayName?.split(':')?.[0]}:${identityAddress.slice(0, 5)}`;
		return updatedUsername;
	};

	const copyLink = (address: string) => {
		copyToClipboard(address);
	};

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
					onVerify={async () => await handleVerify(ESocials.EMAIL, status.email === VerificationStatus.VERFICATION_EMAIL_SENT)}
					value={email?.value}
					verified={isEmailVerified.current || false}
					status={status?.email as VerificationStatus}
					loading={fieldLoading.email}
					fieldName={ESocials.EMAIL}
				/>
			),
			dot: (
				<EmailIcon
					className={`${isEmailVerified.current ? 'bg-[#51D36E] text-white' : 'bg-[#edeff3] text-[#576D8B] dark:bg-section-dark-container'} ' rounded-full p-2.5 text-xl`}
				/>
			),
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
					verified={isTwitterVerified.current || false}
					status={twitterVerificationStart ? VerificationStatus.PLEASE_VERIFY_TWITTER : (status?.twitter as VerificationStatus)}
					loading={fieldLoading.twitter}
					fieldName={ESocials.TWITTER}
				/>
			),
			dot: (
				<TwitterIcon
					className={` ${isTwitterVerified?.current ? 'bg-[#51D36E] text-white' : 'bg-[#edeff3] text-[#576D8B] dark:bg-section-dark-container'} ' rounded-full p-2.5 text-xl`}
				/>
			),
			key: 2
		});
	}

	if (matrix?.value?.length) {
		items.push({
			children: (
				<SocialsLayout
					title='Matrix'
					description={
						<div className='mt-0.5 text-xs tracking-wide'>
							{contextHolder}

							<Tooltip
								title={
									<div
										className='flex cursor-pointer items-center gap-2 text-xs text-white'
										onClick={() => {
											copyLink(handleUpdatedUserName());
											success('Update display name has been copied');
										}}
									>
										Copy updated display name
										<CopyIcon className='ml-1 text-xl text-lightBlue dark:text-icon-dark-inactive' />
									</div>
								}
							>
								<div className='hover:text-xs'>
									To verify your Matrix ID, please set your Element display name to {handleUpdatedUserName()}. Make sure to follow this format for successful verification.
								</div>
							</Tooltip>
						</div>
					}
					onVerify={() => handleMatrixVerificationClick()}
					value={matrix?.value}
					verified={isMatrixVerified.current || false}
					status={status.matrix as VerificationStatus}
					loading={fieldLoading.matrix}
					fieldName={ESocials.MATRIX}
				/>
			),
			dot: (
				<MatrixIcon
					className={`${isMatrixVerified?.current ? 'bg-[#51D36E] text-white' : 'bg-[#edeff3] text-[#576D8B] dark:bg-section-dark-container'} ' rounded-full p-2.5 text-xl`}
				/>
			),
			key: 3
		});
	}
	const getMatrixDisplayName = async () => {
		if (!matrix?.value?.length) return '';
		let displayName = '';
		try {
			const homeUrl = matrix.value.split(':')[1];

			const response = await fetch(`https://${homeUrl}/_matrix/client/v3/profile/${matrix?.value?.[0] !== '@' ? `@${matrix?.value}` : matrix.value}`, {
				headers: {
					Accept: 'application/json'
				}
			});

			const resJSON = await response.json();
			displayName = resJSON?.displayname || '';
		} catch (err) {
			queueNotification({
				header: 'Error!',
				message: err || '',
				status: NotificationStatus.ERROR
			});

			return '';
		}
		return displayName;
	};

	const handleMatrixVerificationClick = async () => {
		if (!matrix?.value?.length) return;
		const displayName = await getMatrixDisplayName();
		setFieldLoading({ ...fieldLoading, matrix: true });

		if (`${displayName}`?.toLowerCase() == handleUpdatedUserName()?.toLowerCase()) {
			const { data, error } = await nextApiClientFetch<MessageType>('/api/v1/verification/verifyMatrix', {
				matrixHandle: matrix?.value || ''
			});

			if (data?.message == messages.SUCCESS) {
				isMatrixVerified.current = true;
				queueNotification({
					header: 'Success!',
					message: 'Matrix account successfully verified',
					status: NotificationStatus.SUCCESS
				});
			} else {
				queueNotification({
					header: 'Error!',
					message: error || '',
					status: NotificationStatus.ERROR
				});
			}
		} else {
			queueNotification({
				header: 'Error!',
				message: 'The Matrix display name does not match the updated one. Please ensure your display name is correctly set for verification',
				status: NotificationStatus.ERROR
			});
		}
		setFieldLoading({ ...fieldLoading, matrix: false });
	};

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
			isEmailVerified.current = verifiedField;
			handleNewStateUpdation({ email: { ...email, verified: verifiedField } }, true);
		} else if (ESocials.TWITTER == fieldName) {
			isTwitterVerified.current = verifiedField;
			!noStatusUpdate && setStatus({ ...status, twitter: verificationStatus });
			handleNewStateUpdation({ twitter: { ...twitter, verified: verifiedField } }, true);
		} else if (ESocials.MATRIX == fieldName) {
			isMatrixVerified.current = verifiedField;
			!noStatusUpdate && setStatus({ ...status, matrix: verificationStatus });
			handleNewStateUpdation({ matrix: { ...matrix, verified: verifiedField } }, true);
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
			try {
				const newWindow = window.open();
				if (newWindow) {
					newWindow.location.href = data?.url;
				} else {
					// Fallback for mobile browsers
					window.location.href = data?.url;
				}
			} catch (err) {
				// Final fallback
				window.location.href = data?.url;
			}
		} else if (error) {
			// Handle specific error cases
			let errorMessage = error;
			if (error.includes('temporarily unavailable')) {
				errorMessage = 'Twitter service is temporarily unavailable. Please try again in a few minutes.';
			} else if (error.includes('API credentials')) {
				errorMessage = 'There was an issue with the Twitter verification service. Please contact support.';
			}
			queueNotification({
				header: 'Error!',
				message: errorMessage,
				status: NotificationStatus.ERROR
			});
			setTwitterVerificationStart(false);
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
		if (matrix?.value?.length) {
			(async () => {
				const displayName = await getMatrixDisplayName();
				setMatrixDisplayname(displayName || '');
				await handleVerify(ESocials.MATRIX, true);
			})();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	const handleProceedDisabled = () => {
		let socialsCount = 0;
		let verifiedCount = 0;
		Object?.entries(socials).forEach(([key, value]) => {
			if (value?.value?.length) {
				socialsCount += 1;
			}

			if (key == ESocials.EMAIL) {
				verifiedCount += isEmailVerified.current ? 1 : 0;
			}
			if (key == ESocials.TWITTER) {
				verifiedCount += isTwitterVerified.current ? 1 : 0;
			}
			if (key == ESocials.MATRIX) {
				verifiedCount += isMatrixVerified.current ? 1 : 0;
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
					type='default'
				/>
				<CustomButton
					text='Proceed'
					onClick={handleJudgement}
					disabled={handleProceedDisabled()}
					buttonsize='xs'
					type='primary'
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
