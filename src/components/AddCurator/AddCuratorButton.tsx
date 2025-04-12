// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useMemo, useState } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import AddCurator from './index';
import { useAddCuratorSelector, useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import AddressConnectModal from '~src/ui-components/AddressConnectModal';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { useDispatch } from 'react-redux';
import { addCuratorActions } from '~src/redux/AddCurator';
import Image from 'next/image';
import classNames from 'classnames';
import { useTheme } from 'next-themes';

const AddCuratorButton = () => {
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();
	const { proposer } = useAddCuratorSelector();
	const { addresses: linkedAddresses, loginAddress } = useUserDetailsSelector();
	const [open, setOpen] = useState(false);
	const [openAddressConnectModal, setOpenAddressConnectModal] = useState<boolean>(false);

	const handleClick = () => {
		if (!proposer || getEncodedAddress(proposer, network)) {
			setOpenAddressConnectModal(true);
		} else {
			setOpen(true);
		}
	};

	const isAddCuratorButtonEnable = useMemo(() => {
		const isEnable = linkedAddresses?.some((address) => {
			getEncodedAddress(address, network) == getEncodedAddress(loginAddress, network);
		});
		return isEnable;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [linkedAddresses]);

	return (
		<div className='mb-6'>
			<CustomButton
				onClick={handleClick}
				disabled={!isAddCuratorButtonEnable}
				className={classNames('w-full text-base font-medium', isAddCuratorButtonEnable ? '' : 'opacity-50')}
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
				theme={theme}
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
