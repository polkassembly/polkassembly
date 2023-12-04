// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import ProposerTab from './ProposerTab';
import AuditTab from './AuditTab';
import ProgressReport from './ProgressReport';
// import { useTheme } from 'next-themes';

interface Props {
	auditData?: any;
	videoData?: any;
}

const index: FC<Props> = ({ auditData, videoData }) => {
	// const { resolvedTheme: theme } = useTheme();
	return (
		<div>
			<ProposerTab className='' />
			<AuditTab
				auditData={auditData}
				videoData={videoData}
				// theme={theme}
				className='my-4'
			/>
			<ProgressReport className='' />
		</div>
	);
};

export default index;
