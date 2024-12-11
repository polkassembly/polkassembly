// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslation } from 'next-i18next';
import { useTheme } from 'next-themes';
import React, { FC, useState } from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';

interface ILoginToVoteOrEndorseProps {
	to?: string;
	isUsedInDefaultValueModal?: boolean;
}

const LoginToVoteOrEndorse: FC<ILoginToVoteOrEndorseProps> = (props) => {
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const { isUsedInDefaultValueModal } = props;
	const { resolvedTheme: theme } = useTheme();
	const { t } = useTranslation('common');

	return (
		<div>
			<CustomButton
				variant='primary'
				fontSize='lg'
				onClick={() => {
					setModalOpen(!modalOpen);
				}}
				className={`mx-auto mb-8 w-full rounded-xxl p-[26px] font-semibold lg:w-[480px] xl:w-full ${isUsedInDefaultValueModal ? 'mt-4' : ''}`}
			>
				{isUsedInDefaultValueModal ? t('login_signup') : t('cast_vote')}
			</CustomButton>
			<ReferendaLoginPrompts
				theme={theme}
				modalOpen={modalOpen}
				setModalOpen={setModalOpen}
				image='/assets/Gifs/login-vote.gif'
				title={isUsedInDefaultValueModal ? t('join_polkassembly_to_use_batch_voting') : t('join_polkassembly_to_vote_on_this_proposal')}
				subtitle={t('discuss_contribute_get_regular_updates_from_polkassembly')}
			/>
		</div>
	);
};

export default LoginToVoteOrEndorse;
