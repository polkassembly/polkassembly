// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal } from 'antd';
import Signup from 'pages/signup';
import { useNetworkContext } from '~src/context';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import { poppins } from 'pages/_app';
import styled from 'styled-components';

interface Props{
    modalOpen:boolean;
    setModalOpen:( pre:boolean)=>void;
    isModal?:boolean
    setLoginOpen?:(pre:boolean)=>void;
    className?:string;
    closable?: boolean;
    isDelegation?: boolean;
}

const SignupPopup=({ modalOpen, setModalOpen, isModal, setLoginOpen, className, closable, isDelegation }:Props) => {
	const { network }=useNetworkContext();
	return <Modal
		open={modalOpen}
		footer={false}
		closable={closable}
		maskClosable={closable}
		wrapClassName={className}
		className={`${poppins.variable} ${poppins.className} max-w-full shrink-0  padding-0`}
		onCancel={() => setModalOpen(false)}
		closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive'/>}>
		<Signup network={network}  isModal={isModal} setLoginOpen={setLoginOpen} setSignupOpen={setModalOpen} isDelegation={isDelegation}/>
	</Modal>;
};
export default styled(SignupPopup)`
 
.padding-0 .ant-modal-content{
  padding:0px !important;
  border-radius:4px;
}`;