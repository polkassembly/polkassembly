// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal, Steps } from 'antd';
import classNames from 'classnames';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { poppins } from 'pages/_app';
import { useState } from 'react';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { EChildBountySteps } from './types';
import styled from 'styled-components';
import WriteChildBounty from './WriteChildBounty';
import { useChildBountyCreationSelector } from '~src/redux/selectors';
import CreateChildBounty from './CreateChildBounty';
import ChildBountySuccessModal from './ChildBountySuccessModal';

interface ICreateBounty {
	className?: string;
	open: boolean;
	openSuccessModal: boolean;
	setOpen: (pre: boolean) => void;
	setOpenSuccessModal: (pre: boolean) => void;
}

const ChildBountyCreationForm = ({ className, open, setOpen, openSuccessModal, setOpenSuccessModal }: ICreateBounty) => {
	const { resolvedTheme: theme } = useTheme();
	const { firstStepPercentage, secondStepPercentage } = useChildBountyCreationSelector();

	const [step, setStep] = useState(EChildBountySteps.WRITE_CHILDBOUNTY);

	return (
		<div>
			<Modal
				open={open}
				maskClosable={false}
				onCancel={() => setOpen(false)}
				className={`${poppins.className} ${poppins.variable} antSteps w-[600px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName={`${className} dark:bg-modalOverlayDark antSteps`}
				footer={false}
				closeIcon={<CloseIcon />}
				title={
					<div className='-mx-6 flex items-center gap-2 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-4 text-lg font-semibold text-bodyBlue dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high'>
						<Image
							src={'/assets/openGovProposals/create_proposal.svg'}
							height={26}
							width={26}
							alt=''
							className={theme == 'dark' ? 'dark-icons' : '-mt-4'}
						/>
						<span>Create Child Bounty</span>
					</div>
				}
			>
				<div className='mt-4'>
					<div className={theme}>
						<Steps
							className={classNames(theme, 'mt-6 font-medium text-bodyBlue dark:text-blue-dark-high')}
							percent={step === EChildBountySteps.WRITE_CHILDBOUNTY ? firstStepPercentage : secondStepPercentage}
							current={step == EChildBountySteps.WRITE_CHILDBOUNTY ? 0 : 1}
							size='default'
							labelPlacement='vertical'
							items={[
								{
									title: EChildBountySteps.WRITE_CHILDBOUNTY
								},
								{
									title: EChildBountySteps.CREATE_CHILDBOUNTY
								}
							]}
						/>
					</div>

					{step == EChildBountySteps.WRITE_CHILDBOUNTY ? (
						<WriteChildBounty setStep={setStep} />
					) : (
						<CreateChildBounty
							setStep={setStep}
							setOpenSuccessModal={setOpenSuccessModal}
							setCloseModal={() => setOpen(false)}
						/>
					)}
				</div>
			</Modal>
			<ChildBountySuccessModal
				open={openSuccessModal}
				setOpen={setOpenSuccessModal}
				setStep={setStep}
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
