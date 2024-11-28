// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal, Steps } from 'antd';
import classNames from 'classnames';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { dmSans } from 'pages/_app';
import { useEffect, useState } from 'react';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { EChildBountySteps } from './types';
import styled from 'styled-components';
import WriteChildBounty from './WriteChildBounty';
import { useChildBountyCreationSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import CreateChildBounty from './CreateChildBounty';
import ChildBountySuccessModal from './ChildBountySuccessModal';
import { useApiContext } from '~src/context';
import { Wallet } from '~src/types';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { getMultisigAddressDetails } from '../DelegationDashboard/utils/getMultisigAddressDetails';
import { useTranslation } from 'next-i18next';

interface ICreateBounty {
	className?: string;
	open: boolean;
	openSuccessModal: boolean;
	setOpen: (pre: boolean) => void;
	setOpenSuccessModal: (pre: boolean) => void;
	handleSuccess?: () => void;
	defaultCurator?: string;
}

const ChildBountyCreationForm = ({ className, open, setOpen, openSuccessModal, setOpenSuccessModal, handleSuccess, defaultCurator }: ICreateBounty) => {
	const { resolvedTheme: theme } = useTheme();
	const { t } = useTranslation('common');
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const { loginAddress, multisigAssociatedAddress, loginWallet } = useUserDetailsSelector();
	const { firstStepPercentage, secondStepPercentage } = useChildBountyCreationSelector();
	const [step, setStep] = useState(EChildBountySteps.WRITE_CHILDBOUNTY);
	const [multisigData, setMultisigData] = useState<{ threshold: number; signatories: string[] }>({
		signatories: [],
		threshold: 0
	});

	const handleMultisigAddress = async () => {
		if (!api || !apiReady || !loginAddress?.length || !network) return;
		let defaultWallet: Wallet | null = loginWallet;
		if (!defaultWallet) {
			defaultWallet = (window.localStorage.getItem('loginWallet') as Wallet) || null;
		}

		if (!defaultWallet) return;

		await getAccountsFromWallet({ api, apiReady, chosenWallet: defaultWallet || loginWallet, loginAddress: '', network });

		const data = await getMultisigAddressDetails(loginAddress);
		if (data?.threshold) {
			const filteredSignatories: string[] = [];

			data?.multi_account_member?.map((addr: { address: string }) => {
				if (getEncodedAddress(addr?.address || '', network) !== getEncodedAddress(multisigAssociatedAddress || '', network)) {
					filteredSignatories?.push(addr?.address);
				}
			});

			setMultisigData({
				signatories: filteredSignatories,
				threshold: data?.threshold || 0
			});
		}
	};

	useEffect(() => {
		handleMultisigAddress();
	}, [api, apiReady, network, multisigAssociatedAddress, loginAddress]);

	return (
		<div>
			<Modal
				open={open}
				maskClosable={false}
				onCancel={() => setOpen(false)}
				className={`${dmSans.className} ${dmSans.variable} antSteps w-[600px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName={`${className} dark:bg-modalOverlayDark antSteps`}
				footer={false}
				closeIcon={<CloseIcon />}
				title={
					<div className='flex items-center gap-2 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						<Image
							src='/assets/openGovProposals/create_proposal.svg'
							height={26}
							width={26}
							alt={t('create_child_bounty_icon')}
							className={theme === 'dark' ? 'dark-icons' : '-mt-4'}
						/>
						<span>{t('create_child_bounty')}</span>
					</div>
				}
			>
				<div className='mt-4'>
					<div className={theme}>
						<Steps
							className={classNames(theme, 'mt-6 font-medium text-bodyBlue dark:text-blue-dark-high')}
							percent={step === EChildBountySteps.WRITE_CHILDBOUNTY ? firstStepPercentage : secondStepPercentage}
							current={step === EChildBountySteps.WRITE_CHILDBOUNTY ? 0 : 1}
							size='default'
							labelPlacement='vertical'
							items={[
								{
									title: t('write_child_bounty_step')
								},
								{
									title: t('create_child_bounty_step')
								}
							]}
						/>
					</div>

					{step === EChildBountySteps.WRITE_CHILDBOUNTY ? (
						<WriteChildBounty setStep={setStep} />
					) : (
						<CreateChildBounty
							setStep={setStep}
							setOpenSuccessModal={setOpenSuccessModal}
							setCloseModal={() => setOpen(false)}
							multisigData={multisigData}
							handleSuccess={handleSuccess}
							defaultCurator={defaultCurator}
						/>
					)}
				</div>
			</Modal>
			<ChildBountySuccessModal
				open={openSuccessModal}
				setOpen={setOpenSuccessModal}
				setStep={setStep}
				multisigData={multisigData}
			/>
		</div>
	);
};

export default styled(ChildBountyCreationForm)`
	input::placeholder {
		color: #7c899b;
		font-weight: 400 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		letter-spacing: 0.0025em !important;
	}
`;
