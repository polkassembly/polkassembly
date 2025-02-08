// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import AddCurator from './index';
import { useAddCuratorSelector, useNetworkSelector } from '~src/redux/selectors';
import AddressConnectModal from '~src/ui-components/AddressConnectModal';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { useDispatch } from 'react-redux';
import { addCuratorActions } from '~src/redux/AddCurator';
import Image from 'next/image';

const AddCuratorButton = () => {
	const dispatch = useDispatch();
	const { network } = useNetworkSelector();
	const { proposer } = useAddCuratorSelector();
	const [open, setOpen] = useState(false);
	const [openAddressConnectModal, setOpenAddressConnectModal] = useState<boolean>(false);

	const handleClick = () => {
		if (!proposer || getEncodedAddress(proposer, network)) {
			setOpenAddressConnectModal(true);
		} else {
			setOpen(true);
		}
	};

	return (
		<div className='mb-6'>
			<CustomButton
				onClick={handleClick}
				className='w-full text-base font-medium'
				variant='primary'
			>
				<div className='flex gap-2'>
					<Image
						src={'/assets/icons/add-curator.svg'}
						alt='addCurator'
						width={20}
						height={20}
					/>
					<span>Add Curator</span>
				</div>
			</CustomButton>
			<AddCurator
				onClose={() => setOpen(false)}
				open={open}
			/>
			<AddressConnectModal
				open={openAddressConnectModal}
				setOpen={setOpenAddressConnectModal}
				linkAddressNeeded
				onConfirm={(address: string) => {
					dispatch(addCuratorActions.updateProposer(address));
					setOpen(true);
				}}
			/>
		</div>
	);
};

export default AddCuratorButton;
