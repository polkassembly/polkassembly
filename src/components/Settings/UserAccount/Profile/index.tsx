// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import ProfileIcon from '~assets/icons/profile-icon.svg';
import EditPencilIcon from '~assets/icons/edit-pencil.svg';
import PasswordDotIcon from '~assets/icons/password-dot.svg';
import { Collapse } from '../../Notifications/common-ui/Collapse';
import { Divider } from 'antd';
import { useUserDetailsContext } from '~src/context';
import ChangeUsername from '../Modals/ChangeUsername';
import ChangeEmail from '../Modals/ChangeEmail';
import ChangePassword from '../Modals/ChangePassword';
import TwoFactorAuth from '../../TwoFactorAuth';

const { Panel } = Collapse;
type Props = {};

const Row = ({ label, data, handleEdit }: { label: string, data: string, handleEdit: any }) => (
	<div className='flex justify-between items-baseline'>
		<div>
			<label className='text-[#485F7D] text-[14px]' htmlFor={label}>{label}</label>
			<p className='font-medium text-[#243A57]'>{label === 'Password' ? <div className='flex gap-1 mt-2'>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => <PasswordDotIcon key={id} />)}
			</div>
				: data}</p>
		</div>
		<span className='text-[14px] font-medium text-pink_primary cursor-pointer flex items-center gap-1' onClick={handleEdit}>
			<EditPencilIcon /> Edit
		</span>
	</div>
);

export enum ModalType {
	USERNAME = 'username',
	EMAIL = 'email',
	PASSWORD = 'password',
}

// eslint-disable-next-line no-empty-pattern
export default function ProfileSettings({ }: Props) {
	const { username, email, web3signup } = useUserDetailsContext();
	const [showModal, setShowModal] = useState<ModalType | null>(null);
	const { id } = useUserDetailsContext();
	return (
		<Collapse
			size='large'
			className='bg-white'
			expandIconPosition='end'
			expandIcon={({ isActive }) => {
				return isActive ? <CollapseIcon /> : <ExpandIcon />;
			}}
		>
			<Panel
				header={
					<div className='flex items-center gap-[6px] channel-header'>
						<ProfileIcon />
						<h3 className='font-semibold text-[16px] text-[#243A57] md:text-[18px] tracking-wide leading-[21px] mb-0 mt-[2px]'>
							Profile Settings
						</h3>
					</div>
				}
				key='1'
			>
				<div className='flex flex-col gap-6'>
					<Row label='Username' data={username || ''} handleEdit={() => setShowModal(ModalType.USERNAME)} />
					<Divider className='m-0' />
					<Row label='Email' data={email || ''} handleEdit={() => setShowModal(ModalType.EMAIL)} />
					<Divider className='m-0' />
					{!web3signup && <Row label='Password' data={username || ''} handleEdit={() => setShowModal(ModalType.PASSWORD)} />}
				</div>
				<ChangeUsername
					onCancel={() => setShowModal(null)}
					username={username || ''}
					onConfirm={() => { }}
					open={showModal === ModalType.USERNAME} />
				<ChangePassword
					onCancel={() => setShowModal(null)}
					onConfirm={() => { }}
					open={showModal === ModalType.PASSWORD} />
				<ChangeEmail
					onCancel={() => setShowModal(null)}
					email={email || ''}
					onConfirm={() => { }}
					open={showModal === ModalType.EMAIL} />
				{id && <TwoFactorAuth className='mt-2' />}
			</Panel>
		</Collapse>
	);
}
