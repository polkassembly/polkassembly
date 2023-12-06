// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import ProposerTab from './ProposerTab';
import AuditTab from './AuditTab';
// import ProgressReport from './ProgressReport';
import BeneficiariesTab from './BeneficiariesTab';
import { usePostDataContext } from '~src/context';
// import { useTheme } from 'next-themes';

interface Props {
	auditData?: any;
	videoData?: any;
}

const IndexComponent: FC<Props> = ({ auditData, videoData }) => {
	// const { resolvedTheme: theme } = useTheme();
	const postedBy = usePostDataContext();
	return (
		<div className=''>
			<ProposerTab className='' />
			{postedBy?.postData?.beneficiaries && postedBy?.postData?.beneficiaries?.length > 0 && <BeneficiariesTab className='' />}
			<AuditTab
				auditData={auditData}
				videoData={videoData}
				className='my-4'
			/>
			{/* progress report dropdown component */}
			{/* <ProgressReport className='' /> */}
		</div>
	);
};

export default IndexComponent;
