// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { useUserDetailsContext } from '~src/context';
import Enable2FA from './Enable2FA';
import Disable2FA from './Disable2FA';
import { useTheme } from 'next-themes';

const TwoFactorAuth: FC<{className?: string}> = ({ className }) => {
	const { is2FAEnabled } = useUserDetailsContext();
	const { resolvedTheme:theme } = useTheme();

	return (
		<section className={className}>
			{ !is2FAEnabled ? <Enable2FA theme={theme} /> : <Disable2FA theme={theme} /> }
		</section>
	);
};

export default TwoFactorAuth;