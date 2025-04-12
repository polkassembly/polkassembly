// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import HelperTooltip from '~src/ui-components/HelperTooltip';
import SelectTracks from '../OpenGovTreasuryProposal/SelectTracks';
import Input from '~src/basic-components/Input';
import { useDispatch } from 'react-redux';
import { useAddCuratorSelector, useNetworkSelector } from '~src/redux/selectors';
import { addCuratorActions } from '~src/redux/AddCurator';
import { useCallback, useState } from 'react';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IPreimageData } from 'pages/api/v1/preimages/latest';
import _ from 'lodash';
import { isHex } from '@polkadot/util';
import { useApiContext } from '~src/context';
import { network as AllNetworks } from 'src/global/networkConstants';
import { Proposal } from '@polkadot/types/interfaces';
import { Bytes } from '@polkadot/types';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import { Spin } from 'antd';

interface IParams {
	trackArr: string[];
}

const checkPreimageHash = (preimageHash: string) => {
	if (!preimageHash) return false;

	return !isHex(preimageHash, 256);
};

const PreimageAlreadyExists = ({ trackArr }: IParams) => {
	const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { preimage, track } = useAddCuratorSelector();
	const [loading, setLoading] = useState<boolean>(false);

	const invalidPreimageHash = useCallback(() => checkPreimageHash(preimage.hash), [preimage?.hash]);

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
			if (!proposal) {
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

	const handlePreimageHash = async (preimageHash: string) => {
		if (invalidPreimageHash()) return;

		setLoading(true);
		const { data, error } = await nextApiClientFetch<IPreimageData>(`api/v1/preimages/latest?hash=${preimageHash}`);

		if (data?.message || error) {
			await getPreiamgeDataFromApi(preimageHash);
		}
		if (data) {
			dispatch(addCuratorActions.updateAlreadyPreimage(true));
			dispatch(addCuratorActions.updateCuratorPreimage({ hash: preimageHash, length: data?.length || 0 }));
		}

		setLoading(false);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncePreimageHash = useCallback(_.debounce(handlePreimageHash, 1000), []);

	return (
		<Spin
			spinning={loading}
			tip='Verifying Preimage ...'
		>
			<div>
				<div className='preimage mt-4'>
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
					{invalidPreimageHash() && <span className='text-sm text-[#ff4d4f]'>Invalid Preimage hash</span>}
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
					<SelectTracks
						tracksArr={trackArr}
						onTrackChange={(trackName: string) => {
							dispatch(addCuratorActions.updateTrack(trackName));
						}}
						selectedTrack={track as string}
					/>
				</div>
			</div>
		</Spin>
	);
};
export default PreimageAlreadyExists;
