// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTheme } from 'next-themes';
import React, { FC, useState } from 'react';
import CustomButton from '~src/basic-component/buttons/CustomButton';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';

interface ILoginToVoteOrEndorseProps {
	to?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LoginToVoteOrEndorse: FC<ILoginToVoteOrEndorseProps> = (props) => {
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();

	return (
		<div>
			<CustomButton
				variant='primary'
				text='Cast Vote'
				onClick={() => {
					setModalOpen(!modalOpen);
				}}
				className='mb-3 w-[100%]'
			/>
			<ReferendaLoginPrompts
				theme={theme}
				modalOpen={modalOpen}
				setModalOpen={setModalOpen}
				image='/assets/referenda-vote.png'
				title='Join Polkassembly to Vote on this proposal.'
				subtitle='Discuss, contribute and get regular updates from Polkassembly.'
			/>
		</div>
	);
};

export default LoginToVoteOrEndorse;
