// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTheme } from 'next-themes';
import React, { FC, useState } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';

interface ILoginToVoteOrEndorseProps {
	to?: string;
	isUsedInDefaultValueModal?: boolean;
}

const LoginToVoteOrEndorse: FC<ILoginToVoteOrEndorseProps> = (props) => {
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const { isUsedInDefaultValueModal } = props;
	const { resolvedTheme: theme } = useTheme();

	return (
		<div>
			<CustomButton
				variant='primary'
				fontSize='lg'
				onClick={() => {
					setModalOpen(!modalOpen);
				}}
				className={`mx-auto mb-8 w-full rounded-xxl p-[26px] font-semibold lg:w-[480px] xl:w-full ${isUsedInDefaultValueModal ? 'mt-4' : ''}`}
			>
				{isUsedInDefaultValueModal ? 'Login/Signup' : 'Cast Vote'}
			</CustomButton>
			<ReferendaLoginPrompts
				theme={theme}
				modalOpen={modalOpen}
				setModalOpen={setModalOpen}
				image='/assets/Gifs/login-vote.gif'
				title={isUsedInDefaultValueModal ? 'Join Polkassembly to use batch voting' : 'Join Polkassembly to Vote on this proposal.'}
				subtitle='Discuss, contribute and get regular updates from Polkassembly.'
			/>
		</div>
	);
};

export default LoginToVoteOrEndorse;
