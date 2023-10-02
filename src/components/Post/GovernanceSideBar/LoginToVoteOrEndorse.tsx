// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
import React, { FC, useState } from 'react';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';

interface ILoginToVoteOrEndorseProps {
	to?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LoginToVoteOrEndorse: FC<ILoginToVoteOrEndorseProps> = (props) => {
	const [modalOpen, setModalOpen] = useState<boolean>(false);

	return (
		<div>
			<Button
				className='mb-3 flex w-[100%] items-center justify-center rounded-lg border-pink_primary bg-pink_primary p-7 text-lg text-white hover:border-pink_primary  hover:bg-pink_secondary '
				onClick={() => {
					setModalOpen(!modalOpen);
				}}
			>
				Cast Vote
			</Button>
			<ReferendaLoginPrompts
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
