// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Modal } from 'antd';
import { poppins } from 'pages/_app';
import React, { useState } from 'react';
import styled from 'styled-components';
import CautionIcon from '~assets/icons/grey-caution.svg';
import WalletConnectModal from '~src/ui-components/WalletConnectModal';

interface Props{
  className: string;
}
const DecisionDepositCard = ({ className }: Props) => {
	const [openModal, setOpenModal] = useState<boolean>(false);

	return <div className='w-full p-6 text-bodyBlue rounded-[14px] mb-8 bg-white'>
		<h2 className='font-semibold tracking-[0.015em] text-xl shadow-[0px 6px 18px 0px #0000000F]'>Decision Deposit</h2>
		<div className='flex mt-6 gap-2'>
			<span><CautionIcon/></span>
			<span className='text-sm tracking-wide'>What is decision deposit/or why pay decision deposit + the amount?</span>
		</div>
		<Button onClick={() => setOpenModal(true)} className='bg-pink_primary text-sm font-medium text-white mt-4 rounded-[4px] h-[40px] w-full tracking-wide'>Pay Decision Deposit</Button>
		<WalletConnectModal className={className} title='Pay Decision Deposit' payDecisionDeposit={true} open={openModal} setOpen={setOpenModal} closable footerTitle='Confirm' selectionFormTitle='Beneficiary Address'/>
	</div>;
};

export default styled(DecisionDepositCard)`
.pay-decision-deposite .ant-modal-content{
  padding: 16px 0px !important;

}`;