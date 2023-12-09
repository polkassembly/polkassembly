// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useEffect } from 'react';
import ProposerTab from './ProposerTab';
import AuditTab from './AuditTab';
// import ProgressReport from './ProgressReport';
import BeneficiariesTab from './BeneficiariesTab';
import { usePostDataContext } from '~src/context';
import { useTheme } from 'next-themes';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { trackEvent } from 'analytics';
// import { useTheme } from 'next-themes';

interface Props {
	auditData?: any;
	videoData?: any;
}

const IndexComponent: FC<Props> = ({ auditData, videoData }) => {
	const { resolvedTheme: theme } = useTheme();
	const currentUser = useUserDetailsSelector();
	useEffect(() => {
		trackEvent('evaluationTab_clicked', 'clicked_evaluation_tab', {
			isWeb3Login: currentUser?.web3signup,
			userId: currentUser?.id || '',
			userName: currentUser?.username || ''
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const postedBy = usePostDataContext();
	return (
		<div className=''>
			<ProposerTab className='' />
			{postedBy?.postData?.beneficiaries && postedBy?.postData?.beneficiaries?.length > 0 && <BeneficiariesTab className='' />}
			<AuditTab
				auditData={auditData}
				videoData={videoData}
				className='my-4'
				theme={theme}
			/>
			{/* progress report dropdown component */}
			{/* <ProgressReport className='' /> */}
		</div>
	);
};

export default IndexComponent;
