// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal } from "antd";
import { useNetworkContext } from "~src/context";
import CloseIcon from "public/assets/icons/close.svg";
import { poppins } from "pages/_app";
import Login from "pages/login";
import styled from "styled-components";

interface Props {
    modalOpen: boolean;
    setModalOpen: (pre: boolean) => void;
    isModal: boolean;
    setSignupOpen: (pre: boolean) => void;
    className?: string;
    closable?: boolean;
    isDelegation?: boolean;
}

const LoginPopup = ({
    modalOpen,
    setModalOpen,
    isModal,
    setSignupOpen,
    className,
    closable,
    isDelegation
}: Props) => {
    const { network } = useNetworkContext();
    return (
        <Modal
            open={modalOpen}
            footer={false}
            closable={closable}
            maskClosable={closable}
            zIndex={1008}
            wrapClassName={className}
            className={`${poppins.variable} ${poppins.className} padding-0 `}
            onCancel={() => setModalOpen && setModalOpen(false)}
            closeIcon={<CloseIcon />}
        >
            <Login
                network={network}
                isModal={isModal}
                setLoginOpen={setModalOpen}
                setSignupOpen={setSignupOpen}
                isDelegation={isDelegation}
            />
        </Modal>
    );
};
export default styled(LoginPopup)`
    .padding-0 .ant-modal-content {
        padding: 0px !important;
        border-radius: 4px;
    }
`;
