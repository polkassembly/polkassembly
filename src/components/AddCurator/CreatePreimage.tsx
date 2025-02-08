// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Form, Radio } from 'antd';
import classNames from 'classnames';
import { useCallback, useMemo, useState } from 'react';
import Input from '~src/basic-components/Input';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import SelectTracks from '../OpenGovTreasuryProposal/SelectTracks';
import { useAddCuratorSelector, useNetworkSelector } from '~src/redux/selectors';
import { IPreimageData } from 'pages/api/v1/preimages/latest';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useDispatch } from 'react-redux';
import { addCuratorActions } from '~src/redux/AddCurator';
import _ from 'lodash';
import { useApiContext, usePostDataContext } from '~src/context';
import { isHex } from '@polkadot/util';
import { Proposal } from '@polkadot/types/interfaces';
import { Bytes } from '@polkadot/types';
import { convertAnyHexToASCII } from '~src/util/decodingOnChainInfo';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import { network as AllNetworks, chainProperties } from 'src/global/networkConstants';
import AddressInput from '~src/ui-components/AddressInput';
import getEncodedAddress from '~src/util/getEncodedAddress';
import BN from 'bn.js';
import Balance from '../Balance';
import Address from '~src/ui-components/Address';
import BalanceInput from '~src/ui-components/BalanceInput';
import { useTheme } from 'next-themes';
import { inputToBn } from '~src/util/inputToBn';

interface IParams {
	className?: string;
}
const ZERO_BN = new BN(0);
const CreatePreimage = ({ className }: IParams) => {
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const {
		postData: { reward, requested }
	} = usePostDataContext();
	const { preimage, proposer } = useAddCuratorSelector();
	// const form = Form.useForm();
	const [isPreimage, setIsPreimage] = useState(null);
	const [availableBalance, setAvailableBalance] = useState<BN>(ZERO_BN);

	console.log({ reward, requested });

	const checkPreimageHash = (preimageLength: number | null, preimageHash: string) => {
		if (!preimageHash || preimageLength === null) return false;
		return !isHex(preimageHash, 256) || !preimageLength || preimageLength === 0;
	};

	const getPreiamgeDataFromApi = async (preimageHash: string) => {
		if (!api || !apiReady) return;
		const lengthObj = await api?.query?.preimage?.statusFor(preimageHash);
		const preimageLength = JSON.parse(JSON.stringify(lengthObj))?.unrequested?.len || 0;

		const preimageRaw: any = await api?.query?.preimage?.preimageFor([preimageHash, preimageLength]);
		const preimage =
			preimageRaw ?? ([AllNetworks.KUSAMA, AllNetworks.POLKADOT].includes(network) ? preimageRaw?.unwrap?.()?.[0] : (preimageRaw.unwrapOr(null) as any))?.info.hash.toHex();

		const constructProposal = function (bytes: Bytes): Proposal | undefined {
			let proposal: Proposal | undefined;

			try {
				proposal = api.registry?.createType('Proposal', bytes?.toU8a(true)) as unknown as any;
			} catch (error) {
				console.log(error);
			}

			return proposal;
		};

		try {
			const proposal = constructProposal(preimage);
			if (proposal) {
				const params = proposal?.meta ? proposal?.meta.args.filter(({ type }): boolean => type.toString() !== 'Origin').map(({ name }) => name.toString()) : [];

				const values = proposal?.args;
				const preImageArguments = convertAnyHexToASCII(
					proposal?.args &&
						params &&
						params.map((name, index) => {
							return {
								name,
								value: values?.[index]?.toString()
							};
						}),
					network
				);
				console.log({ preImageArguments });
			} else {
				queueNotification({
					header: 'Failed!',
					message: `Incorrect preimage for ${network} network.`,
					status: NotificationStatus.ERROR
				});
			}
		} catch (error) {
			queueNotification({
				header: 'Failed!',
				message: error.message,
				status: NotificationStatus.ERROR
			});
		}
	};
	const invalidPreimageHash = useMemo(() => checkPreimageHash(preimage.length, preimage.hash), [preimage]);

	const handlePreimageHash = async (preimageHash: string) => {
		const { data, error } = await nextApiClientFetch<IPreimageData>(`api/v1/preimages/latest?hash=${preimageHash}`);

		if (data?.message || error) {
			await getPreiamgeDataFromApi(preimageHash);
		}
		if (data) {
			dispatch(addCuratorActions.updateCuratorPreimage({ hash: preimageHash, length: data?.length || 0 }));
		}

		console.log({ data, preimageHash });
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncePreimageHash = useCallback(_.debounce(handlePreimageHash, 1000), []);

	console.log({ preimage });

	const fundingAmtToBN = () => {
		const [fundingAmt] = inputToBn(new BN(reward || '0').div(new BN('10').pow(new BN(chainProperties[network].tokenDecimals)))?.toString(), network, false);
		console.log(fundingAmt?.toString());
		return fundingAmt;
	};

	return (
		<div className={classNames(className)}>
			<div className='my-8 flex flex-col'>
				<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Do you have an existing preimage? </label>
				<Radio.Group
					size='small'
					className='mt-1.5'
					value={isPreimage}
					onChange={(e) => {
						setIsPreimage(e.target.value);
						dispatch(addCuratorActions.updateCuratorPreimage({ hash: '', length: 0 }));
					}}
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

				{isPreimage && (
					<div>
						<div className='preimage mt-6'>
							<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>
								Preimage Hash{' '}
								<span>
									<HelperTooltip
										text='A unique hash is generate for your preimage and it is used to populate proposal details.'
										className='ml-1'
									/>
								</span>
							</label>
							<Input
								name='preimage_hash'
								className='h-10 rounded-[4px] dark:border-section-dark-container dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								value={preimage?.hash}
								onChange={(e) => {
									dispatch(addCuratorActions.updateCuratorPreimage({ hash: e.target?.value, length: 0 }));
									debouncePreimageHash(e.target.value);
								}}
							/>
							{/* {invalidPreimageHash() && !loading && <span className='text-sm text-[#ff4d4f]'>Invalid Preimage hash</span>} */}
						</div>
						<div className='mt-6'>
							<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Preimage Length</label>
							<Input
								name='preimage_length'
								className='h-10 rounded-[4px] dark:border-section-dark-container dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
								disabled
								value={preimage.length}
							/>
						</div>
						<div className='mt-6'>
							<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>
								Select Track{' '}
								<span>
									<HelperTooltip
										text='Track selection is done based on the amount requested.'
										className='ml-1'
									/>
								</span>
							</label>
							{/* <SelectTracks
								tracksArr={trackArr}
								onTrackChange={(track) => {
									setSelectedTrack(track);
									onChangeLocalStorageSet({ selectedTrack: track }, isPreimage);
									getPreimageTxFee();
									setSteps({ percent: 100, step: 1 });
								}}
								selectedTrack={selectedTrack}
							/> */}
						</div>
					</div>
				)}

				{isPreimage !== null && !isPreimage && (
					<>
						<section className='mt-6'>
							<div className='mt-6 flex items-center justify-between text-lightBlue dark:text-blue-dark-medium '>
								Proposer Address
								<span>
									<Balance
										// isBalanceUpdated={isUpdatedAvailableBalance}
										address={proposer}
										onChange={(balance: string) => setAvailableBalance(new BN(balance || '0'))}
									/>
								</span>
							</div>

							<div className='flex h-10 w-full items-center justify-between rounded-[4px] border-[1px] border-solid border-section-light-container bg-[#f5f5f5] px-2 dark:border-[#3B444F] dark:border-separatorDark dark:bg-section-dark-overlay'>
								<Address
									address={proposer || ''}
									isTruncateUsername={false}
									displayInline
									usernameClassName='text-sm font-medium ml-1'
								/>
							</div>
						</section>

						<section>
							<div className='mt-6 flex items-center justify-between text-lightBlue dark:text-blue-dark-medium '>Curator Address</div>
							<AddressInput
								name='proposer_address'
								defaultAddress={getEncodedAddress(proposer, network) || ''}
								onChange={() => console.log(false)}
								inputClassName={' font-normal text-sm h-10'}
								className='-mt-6 text-sm font-normal text-lightBlue dark:text-blue-dark-medium'
								size='large'
								identiconSize={22}
								iconClassName={'ml-[10px]'}
							/>
						</section>

						<section>
							<div className='-mb-6 mt-6'>
								<div className='mb-[2px] flex items-center justify-between text-sm text-lightBlue dark:text-blue-dark-medium'>
									<label>
										Bounty Amount{' '}
										<span>
											<HelperTooltip
												text='Amount requested in bounty'
												className='ml-1'
											/>
										</span>
									</label>
									{/* <span className='text-xs text-bodyBlue dark:text-blue-dark-medium'>
										Current Value: {<span className='text-pink_primary'>{Math.floor(Number(inputAmountValue) * Number(currentTokenPrice) || 0) || 0} USD</span>}
									</span> */}
								</div>
								<BalanceInput
									address={proposer}
									placeholder='Add funding amount'
									formItemName='bountyAmount'
									theme={theme}
									balance={fundingAmtToBN()}
									disabled={true}
								/>
							</div>
						</section>
					</>
				)}
			</div>
		</div>
	);
};

export default CreatePreimage;
