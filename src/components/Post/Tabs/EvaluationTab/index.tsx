// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useEffect } from 'react';
import AuditTab from './AuditTab';
import { useTheme } from 'next-themes';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { trackEvent } from 'analytics';
import UserInfoTab from './UserInfoTab';
import { usePostDataContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';

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
	const {
		postData: { beneficiaries, postType }
	} = usePostDataContext();
	return (
		<div className=''>
			<UserInfoTab isProposerTab={true} />
			{beneficiaries && beneficiaries.length > 0 && (
				<UserInfoTab
					isProposerTab={false}
					className='mt-4'
				/>
			)}
			{[ProposalType.REFERENDUM_V2].includes(postType) && (
				<AuditTab
					auditData={auditData}
					videoData={videoData}
					className='my-4'
					theme={theme}
				/>
			)}
		</div>
	);
};

export default IndexComponent;
