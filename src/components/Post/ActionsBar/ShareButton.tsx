// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ShareAltOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useContext } from 'react';

import { NetworkContext } from '~src/context/NetworkContext';

const ShareButton = function ({ title }: { title?: string | null }) {
	const { network } = useContext(NetworkContext);

	const share = () => {
		const twitterParameters = [];

		twitterParameters.push(`url=${encodeURI(global.window.location.href)}`);

		if (title) {
			twitterParameters.push(
				`text=${encodeURI(`[${network}] ${title}`)}`
			);
		}

		twitterParameters.push('via=' + encodeURI('polkassembly'));

		const url =
			'https://twitter.com/intent/tweet?' + twitterParameters.join('&');

		global.window.open(url);
	};

	return (
		<>
			<Button
				className={
					'text-pink_primary flex items-center border-none shadow-none px-1 md:px-2'
				}
				onClick={share}
			>
				<ShareAltOutlined /> {' Share'}
			</Button>
		</>
	);
};

export default ShareButton;
