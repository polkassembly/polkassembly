// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal, Steps } from 'antd';
import Image from 'next/image';
import { useState } from 'react';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import WriteProposalDetails from './WriteProposalDetails';
import CreatePreimage from './CreatePreimage';
import styled from 'styled-components';
import classNames from 'classnames';
import { dmSans } from 'pages/_app';
import { useAddCuratorSelector } from '~src/redux/selectors';

interface IParams {
	className?: string;
	open: boolean;
	onClose: () => void;
	theme?: string;
}

enum EAddCuratorSteps {
	WRITE_PROPOSAL = 0,
	CREATE_PROPOSAL = 1
}
const AddCurator = ({ className, open, onClose }: IParams) => {
	const [step, setStep] = useState<EAddCuratorSteps>(EAddCuratorSteps.WRITE_PROPOSAL);
	const {
		proposal: { title, content },
		preimage,
		alreadyPreimage,
		curatorAddress
	} = useAddCuratorSelector();
	const calculatePercentage = () => {
		const increment = (condition: any, value: any) => (condition ? value : 0);

		if (step === EAddCuratorSteps.WRITE_PROPOSAL) {
			// Direct calculation for WRITE_PROPOSAL step
			return increment(title, 50) + increment(content, 50);
		} else {
			if (alreadyPreimage) {
				return increment(preimage?.hash, 50) + increment(preimage?.length, 50);
			} else {
				const individualContribution = 33.33;
				return increment(preimage?.hash, individualContribution) + increment(preimage?.length, individualContribution) + increment(curatorAddress, individualContribution);
			}
		}
	};

	return (
		<div>
			<Modal
				open={open}
				onCancel={() => onClose()}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				className={classNames(className, 'addCurator min-w-[350px] md:min-w-[600px]', dmSans.className, dmSans.variable)}
				wrapClassName={classNames(className, 'dark:bg-modalOverlayDark')}
				footer={false}
				title={
					<div className='-ml-6 -mr-6 flex items-center gap-2 border-0 border-b-[1px] border-solid border-x-section-light-container px-6 pb-2 text-lg dark:border-separatorDark dark:bg-section-dark-overlay'>
						<Image
							src={'/assets/icons/add-curator.svg'}
							alt='addCurator'
							width={24}
							height={24}
						/>
						<div className='align-center flex gap-2 font-semibold tracking-wide text-blue-light-high dark:text-blue-dark-high'>Add Curator</div>
					</div>
				}
			>
				<div className='mt-6'>
					<Steps
						className='px-0 font-medium text-bodyBlue dark:text-blue-dark-high'
						current={step}
						size='default'
						percent={calculatePercentage()}
						labelPlacement='vertical'
						items={[
							{
								title: 'Write Proposal'
							},
							{
								title: 'Create Proposal'
							}
						]}
					/>

					{step === EAddCuratorSteps.WRITE_PROPOSAL && <WriteProposalDetails onchangeNextStep={() => setStep(EAddCuratorSteps.CREATE_PROPOSAL)} />}
					{step === EAddCuratorSteps.CREATE_PROPOSAL && <CreatePreimage pressBack={() => setStep(EAddCuratorSteps.WRITE_PROPOSAL)} />}
				</div>
			</Modal>
		</div>
	);
};

export default styled(AddCurator)`
	.addCurator .ant-progress .ant-progress-inner:not(.ant-progress-circle-gradient) .ant-progress-circle-path {
		stroke: var(--pink_primary);
		stroke-width: 6px;
		background: red;
	}
	.addCurator .ant-steps .ant-steps-item-wait .ant-steps-item-container .ant-steps-item-icon .ant-steps-icon {
		font-size: 14px !important;
		color: #7788a1 !important;
		font-weight: 700 !important;
	}
	.addCurator .ant-steps .ant-steps-item-active .ant-steps-item-container .ant-steps-item-icon .ant-steps-icon {
		font-size: 14px !important;
		font-weight: 700 !important;
	}
	.addCurator .ant-steps .ant-steps-item-wait .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title,
	.addCurator .ant-steps .ant-steps-item-finish .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title,
	.addCurator .ant-steps .ant-steps-item-active .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title {
		font-size: 14px !important;
		color: #96a4b6 !important;
		line-height: 21px !important;
		font-weight: 500 !important;
	}
	.addCurator .ant-steps .ant-steps-item-finish .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title,
	.addCurator .ant-steps .ant-steps-item-active .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title {
		color: var(--bodyBlue) !important;
	}
	.addCurator .ant-steps .ant-steps-item-wait .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title {
		color: #96a4b6 !important;
	}
	.ant-steps .ant-steps-item .ant-steps-item-container .ant-steps-item-tail {
		top: 0px !important;
		padding: 4px 15px !important;
	}
	.addCurator .ant-steps .ant-steps-item-wait > .ant-steps-item-container > .ant-steps-item-tail::after,
	.addCurator .ant-steps .ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-tail::after,
	.addCurator .ant-steps .ant-steps-item-tail::after {
		background-color: #d2d8e0 !important;
	}
	.addCurator .ant-steps.ant-steps-label-vertical .ant-steps-item-content {
		width: 100% !important;
		display: flex !important;
		margin-top: 8px;
	}
	.addCurator .ant-steps .ant-steps-item-finish .ant-steps-item-icon {
		background: #51d36e;
		border: none !important;
	}
	.addCurator .ant-steps .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
		color: white !important;
	}
	.addCurator .ant-steps .ant-steps-item-finish .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title,
	.addCurator .ant-steps .ant-steps-item-active .ant-steps-item-container .ant-steps-item-content .ant-steps-item-title {
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : '#243A57')} !important;
	}
	input::placeholder {
		color: #7c899b;
		font-weight: 400 !important;
		font-size: 14px !important;
		line-height: 21px !important;
		letter-spacing: 0.0025em !important;
	}
	.ant-steps .ant-steps-item-wait .ant-steps-item-icon {
		background-color: ${(props: any) => (props.theme === 'dark' ? '#dde4ed' : 'rgba(0, 0, 0, 0.06)')} !important;
	}
`;
