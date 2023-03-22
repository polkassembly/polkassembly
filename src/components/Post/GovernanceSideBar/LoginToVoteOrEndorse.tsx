// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import { useRouter } from 'next/router';
import React, { FC } from 'react';

interface ILoginToVoteOrEndorseProps {
	to?: string;
}

const LoginToVoteOrEndorse: FC<ILoginToVoteOrEndorseProps> = (props) => {
	const { to } = props;
	const router = useRouter();

	return (
		<div>
			<Button
				className='bg-pink_primary hover:bg-pink_secondary text-lg mb-3 text-white border-pink_primary hover:border-pink_primary rounded-lg flex items-center justify-center p-7 w-[95%]'
				onClick={() => {
					router.push('/login');
				}}
			>
				Log in to {to? to: 'Vote'}
			</Button>
		</div>
	);
};

export default LoginToVoteOrEndorse;