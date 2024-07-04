// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, Form, FormInstance, Input, Radio } from 'antd';
import { useTheme } from 'next-themes';
import { poppins } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import { ISteps } from '~src/components/OpenGovTreasuryProposal';
import { useInitialConnectAddress, useNetworkSelector } from '~src/redux/selectors';
import { IBountyProposerResponse } from '~src/types';
import BalanceInput from '~src/ui-components/BalanceInput';
import formatBnBalance from '~src/util/formatBnBalance';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface Props {
	className?: string;
	setSteps: (pre: ISteps) => void;
	isBounty: boolean | null;
	setIsBounty: (pre: boolean) => void;
	form: FormInstance;
}

const CreateBounty = ({ className, setSteps, isBounty, setIsBounty, form }: Props) => {
	const { network } = useNetworkSelector();
	const { address: linkedAddress } = useInitialConnectAddress();
	const { resolvedTheme: theme } = useTheme();
	const [bountyId, setBountyId] = useState<number | null>(null);
	const [bountyAmount, setBountyAmount] = useState<number | null>(null);
	const [bountyProposer, setBountyProposer] = useState<string | null>(null);

	const handleSubmit = async () => {
		// await form.validateFields();
		setSteps({ percent: 0, step: 2 });
	};

	const fetchBountyProposer = async () => {
		const resp = await nextApiClientFetch<IBountyProposerResponse>('/api/v1/bounty/getProposerInfo', {
			bountyId
		});

		if (resp && resp.data && resp.data?.data?.proposals) {
			setBountyProposer(resp.data?.data?.proposals[0]?.proposer);
			const amount = Number(formatBnBalance(resp.data?.data?.proposals[0]?.reward, { numberAfterComma: 1, withThousandDelimitor: false }, network));
			setBountyAmount(amount);
			form.setFieldsValue({
				Bounty_amount: amount
			});
		}

		if (resp && resp.error) {
			console.log('error in fetching proposer', resp.error);
			setBountyAmount(null);
		}
	};

	useEffect(() => {
		if (bountyId !== null) {
			fetchBountyProposer();
		} else {
			form.setFieldsValue({
				Bounty_amount: ''
			});
			setBountyAmount(null);
			setBountyProposer(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [bountyId]);

	return (
		<div className={`${className} create-bounty`}>
			<div className='my-8 flex flex-col'>
				<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Have you created a bounty already? </label>
				<Radio.Group
					onChange={(e) => {
						setIsBounty(e.target.value);
						// onChangeLocalStorageSet({ isPreimage: e.target.value }, e.target.value, preimageCreated, preimageLinked, true);
						setSteps({ percent: 20, step: 1 });
					}}
					size='small'
					className='mt-1.5'
					value={isBounty}
				>
					<Radio
						value={true}
						className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'
					>
						Yes
					</Radio>
					<Radio
						value={false}
						className='text-sm font-normal text-bodyBlue dark:text-blue-dark-high'
					>
						No
					</Radio>
				</Radio.Group>
			</div>
			<Form
				form={form}
				// disabled={loading}
				onFinish={handleSubmit}
				//initialValues={{
				//after_blocks: String(advancedDetails.afterNoOfBlocks?.toString()),
				//at_block: String(advancedDetails.atBlockNo?.toString()),
				//preimage_hash: preimageHash,
				//preimage_length: preimageLength || 0,
				//proposer_address: proposerAddress
				//}}
				validateMessages={{ required: "Please add the '${name}' " }}
			>
				{isBounty && (
					<>
						<label className='mb-1.5 text-sm text-lightBlue dark:text-blue-dark-high'>Bounty Id</label>
						<Form.Item name='Bounty_id'>
							<Input
								name='Bounty_id'
								className='h-[40px] rounded-[4px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								onChange={(e) => {
									setBountyId(Number(e.target.value));
									// onChangeLocalStorageSet({ title: e.target.value }, Boolean(isDiscussionLinked));
									setSteps({ percent: 100, step: 1 });
								}}
							/>
						</Form.Item>
						{bountyAmount && (
							<>
								<label className='mb-1.5 text-sm text-lightBlue dark:text-blue-dark-high'>Bounty Amount</label>
								<Form.Item name='Bounty_amount'>
									<Input
										name='Bounty_amount'
										className='h-[40px] rounded-[4px] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
										value={bountyAmount}
										disabled
									/>
								</Form.Item>
							</>
						)}
					</>
				)}
				{!isBounty && (
					<>
						<div>
							<BalanceInput
								theme={theme}
								// balance={new BN(fundingAmount || '0')}
								formItemName='balance'
								placeholder='Enter Bounty Amount'
								label='Bounty Amount'
								inputClassName='dark:text-blue-dark-high text-bodyBlue'
								className='mb-0'
								// onChange={(address: BN) => handleOnchange({ ...gov1proposalData, fundingAmount: address.toString() })}
							/>
						</div>
						<div>
							<span className={`${poppins.variable} ${poppins.className} text-sm font-medium text-blue-light-medium dark:text-blue-dark-medium`}>Bounty Bond</span>
							<span className={`${poppins.variable} ${poppins.className} ml-3  text-sm font-semibold text-blue-light-high dark:text-blue-dark-high`}>25 DOT</span>
						</div>
					</>
				)}
				<div className='-mx-6 mt-6 flex justify-end gap-4 border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-section-dark-container'>
					<Button
						onClick={() => {
							setSteps({ percent: 100, step: 0 });
							// setGenralIndex(null);
						}}
						className='h-10 w-[155px] rounded-[4px] border-pink_primary text-sm font-medium tracking-[0.05em] text-pink_primary dark:bg-transparent'
					>
						Back
					</Button>
					<Button
						htmlType='submit'
						className={`${
							isBounty && linkedAddress != bountyProposer ? 'opacity-50' : ''
						} h-10 w-[165px] rounded-[4px] bg-pink_primary text-center text-sm font-medium tracking-[0.05em] text-white
						dark:border-pink_primary`}
						// disabled={}
					>
						{/* {isbounty ? (preimageLinked ? 'Next' : 'Link Bounty') : bountyCreated ? 'Next' : 'Create Bounty'} */}
						Next
					</Button>
				</div>
			</Form>
		</div>
	);
};

export default CreateBounty;
