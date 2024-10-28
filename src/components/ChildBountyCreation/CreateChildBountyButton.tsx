// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// import classNames from 'classnames';
// import { useTheme } from 'next-themes';
import Image from 'next/image';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import ChildBountyCreationForm from '.';
import { ReactNode, useState } from 'react';
import classNames from 'classnames';
import { childBountyCreationActions } from '~src/redux/childBountyCreation';
import { useDispatch } from 'react-redux';

const CreateChildBountyButton = ({
	className,
	children,
	handleSuccess,
	defaultCurator
}: {
	className?: string;
	children?: ReactNode;
	handleSuccess?: () => void;
	defaultCurator?: string;
}) => {
	const dispatch = useDispatch();
	const [openModal, setOpenModal] = useState(false);
	const [openSuccessModal, setOpenSuccessModal] = useState<boolean>(false);

	return (
		<div className={classNames(className, 'flex items-center justify-center ')}>
			<CustomButton
				type='primary'
				className='w-full cursor-pointer text-pink_primary'
				onClick={() => {
					setOpenModal(true);
					dispatch(childBountyCreationActions.setChildBountyCurator(defaultCurator || ''));
				}}
			>
				{children || (
					<div className='flex items-center justify-center gap-2 text-pink_primary'>
						<Image
							src='/assets/icons/child-bounty-icon.svg'
							height={14}
							width={14}
							alt='child_bounties'
							className={'pink-icons'}
						/>
						<span className='text-sm font-semibold text-pink_primary'>Create Child Bounty</span>
					</div>
				)}
			</CustomButton>

			{(openModal || openSuccessModal) && (
				<ChildBountyCreationForm
					open={openModal}
					setOpen={setOpenModal}
					setOpenSuccessModal={setOpenSuccessModal}
					openSuccessModal={openSuccessModal}
					handleSuccess={handleSuccess}
					defaultCurator={defaultCurator}
				/>
			)}
		</div>
	);
};
export default CreateChildBountyButton;
