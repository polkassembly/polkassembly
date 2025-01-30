// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';
import { spaceGrotesk } from 'pages/_app';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import classNames from 'classnames';

const CreateBountyModal = dynamic(() => import('~src/components/UserCreatedBounties/CreateBountyModal'), {
	loading: () => <Skeleton.Button active />,
	ssr: false
});

interface ICreateBountyBtnProps {
	className?: string;
}

const CreateBountyBtn = ({ className }: ICreateBountyBtnProps) => {
	const [openCreateBountyModal, setOpenCreateBountyModal] = useState<boolean>(false);
	const { loginAddress } = useUserDetailsSelector();

	return (
		<div className={className}>
			<CustomButton
				disabled={!loginAddress}
				onClick={() => {
					setOpenCreateBountyModal(true);
				}}
				style={{ background: 'linear-gradient(180deg, #FF50AD 0%, #E5007A 100%, #E5007A 100%)' }}
				className={classNames(
					' flex w-full cursor-pointer items-center justify-center gap-[6px] rounded-[12px] border-none px-6 py-3 md:w-auto md:justify-normal',
					!loginAddress ? 'opacity-50' : ''
				)}
				height={46}
			>
				<ImageIcon
					src='/assets/bounty-icons/proposal-icon.svg'
					alt='bounty icon'
					imgClassName=''
				/>
				<span className={`${spaceGrotesk.className} ${spaceGrotesk.variable} font-bold text-white`}>Create Bounty</span>
			</CustomButton>
			<CreateBountyModal
				openCreateBountyModal={openCreateBountyModal}
				setOpenCreateBountyModal={setOpenCreateBountyModal}
			/>
		</div>
	);
};

export default CreateBountyBtn;
