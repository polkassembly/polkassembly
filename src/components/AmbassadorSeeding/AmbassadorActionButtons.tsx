// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Button, MenuProps } from 'antd';
import ThreeDotsIcon from '~assets/icons/three-dots.svg';
import styled from 'styled-components';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { Dropdown } from '~src/ui-components/Dropdown';
import { EAmbassadorActions } from './types';
import CreateIcon from '~assets/icons/CreateProposalWhite.svg';
import RemoveIcon from '~assets/icons/cancel-referendum-icon.svg';
import ReplaceIcon from '~assets/icons/kill-referendum-icon.svg';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';

const AddAmbassador = dynamic(() => import('./AddAmbassador'), {
	ssr: false
});
const RemoveAmbassador = dynamic(() => import('./RemoveAmbassador'), {
	ssr: false
});
const ReplaceAmbassador = dynamic(() => import('./ReplaceAmbassador'), {
	ssr: false
});

interface Props {
	className?: string;
}

const AmbassadorActionButtons = ({ className }: Props) => {
	const { t } = useTranslation('common');
	const { resolvedTheme: theme } = useTheme();
	const { loginAddress } = useUserDetailsSelector();
	const [isDropdownActive, setIsDropdownActive] = useState(false);
	const [openAmbassadorModal, setOpenAmbassadorModal] = useState<{ action: null | EAmbassadorActions; open: boolean }>({ action: null, open: false });

	const handleOncloseAmbassadorModals = (action: EAmbassadorActions, open: boolean) => {
		switch (action) {
			case EAmbassadorActions.ADD_AMBASSADOR:
				setOpenAmbassadorModal({ action: EAmbassadorActions.ADD_AMBASSADOR, open: open });
				break;
			case EAmbassadorActions.REMOVE_AMBASSADOR:
				setOpenAmbassadorModal({ action: EAmbassadorActions.REMOVE_AMBASSADOR, open: open });
				break;
			case EAmbassadorActions.REPLACE_AMBASSADOR:
				setOpenAmbassadorModal({ action: EAmbassadorActions.REPLACE_AMBASSADOR, open: open });
				break;
		}
	};

	const items: MenuProps['items'] = [
		{
			key: '1',
			label: (
				<div
					className='mb-2 flex items-center space-x-2'
					onClick={() => setOpenAmbassadorModal({ action: EAmbassadorActions.REMOVE_AMBASSADOR, open: true })}
				>
					<RemoveIcon />
					<div className='flex flex-col text-blue-light-medium dark:text-blue-dark-high'>
						<span className='text-sm font-medium '>{t('remove_ambassador')}</span>
						<span className='text-xs font-normal '>{t('remove_ambassador_description')}</span>
					</div>
				</div>
			)
		},
		{
			key: '2',
			label: (
				<div
					className='mb-2 flex items-center space-x-2'
					onClick={() => setOpenAmbassadorModal({ action: EAmbassadorActions.REPLACE_AMBASSADOR, open: true })}
				>
					<ReplaceIcon />
					<div className='flex flex-col text-blue-light-medium dark:text-blue-dark-high'>
						<span className='text-sm font-medium '>{t('replace_ambassador')}</span>
						<span className='text-xs font-normal '>{t('replace_ambassador_description')}</span>
					</div>
				</div>
			)
		}
	];
	return (
		<div className={classNames('flex flex-wrap items-center justify-between', className)}>
			<div className='mr-2'>
				<Button
					disabled={!loginAddress}
					className={`h-10 border-pink_primary bg-pink_primary font-semibold text-white ${!loginAddress ? 'opacity-50' : ''} flex items-center`}
					onClick={() => setOpenAmbassadorModal({ action: EAmbassadorActions.ADD_AMBASSADOR, open: true })}
				>
					<CreateIcon className='mr-2' />
					{t('create_ambassador_application')}
				</Button>
			</div>
			<div>
				<Dropdown
					theme={theme}
					overlayStyle={{ marginTop: '20px' }}
					className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-solid border-section-light-container ${
						theme === 'dark' ? 'border-none max-md:bg-section-dark-background md:bg-section-dark-overlay' : isDropdownActive ? 'bg-section-light-container' : 'bg-white'
					}`}
					overlayClassName='z-[1056]'
					placement='bottomRight'
					menu={{ items }}
					onOpenChange={() => setIsDropdownActive(!isDropdownActive)}
				>
					<span className='ml-1'>
						<ThreeDotsIcon />
					</span>
				</Dropdown>
			</div>
			<AddAmbassador
				open={EAmbassadorActions.ADD_AMBASSADOR === openAmbassadorModal.action && openAmbassadorModal.open}
				setOpen={(open: boolean) => handleOncloseAmbassadorModals(EAmbassadorActions.ADD_AMBASSADOR, open)}
			/>
			<RemoveAmbassador
				open={EAmbassadorActions.REMOVE_AMBASSADOR === openAmbassadorModal.action && openAmbassadorModal.open}
				setOpen={(open: boolean) => handleOncloseAmbassadorModals(EAmbassadorActions.REMOVE_AMBASSADOR, open)}
			/>
			<ReplaceAmbassador
				open={EAmbassadorActions.REPLACE_AMBASSADOR === openAmbassadorModal.action && openAmbassadorModal.open}
				setOpen={(open: boolean) => handleOncloseAmbassadorModals(EAmbassadorActions.REPLACE_AMBASSADOR, open)}
			/>
		</div>
	);
};

export default styled(AmbassadorActionButtons)`
	&.ant-dropdown-menu.ant-dropdown-menu-root.ant-dropdown-menu-vertical {
		margin-top: 20px;
	}
`;
