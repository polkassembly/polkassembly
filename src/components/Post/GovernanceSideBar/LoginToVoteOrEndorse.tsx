// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
import { useTheme } from 'next-themes';
import React, { FC, useState } from 'react';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';

interface ILoginToVoteOrEndorseProps {
	to?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LoginToVoteOrEndorse: FC<ILoginToVoteOrEndorseProps> = (props) => {
	const [modalOpen,setModalOpen]=useState<boolean>(false);
	const { resolvedTheme:theme } = useTheme();
	return (
		<div>
			<Button
				className='bg-pink_primary hover:bg-pink_secondary text-lg mb-3 text-white border-pink_primary hover:border-pink_primary rounded-lg flex items-center justify-center p-7  w-[100%] '
				onClick={() => {
					setModalOpen(!modalOpen);
				}}
			>
				Cast Vote
			</Button>
			<ReferendaLoginPrompts
				theme={theme}
				modalOpen={modalOpen}
				setModalOpen={setModalOpen}
				image="/assets/referenda-vote.png"
				title="Join Polkassembly to Vote on this proposal."
				subtitle="Discuss, contribute and get regular updates from Polkassembly."/>
		</div>
	);
};

export default LoginToVoteOrEndorse;