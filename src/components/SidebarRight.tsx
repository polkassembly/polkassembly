// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Drawer } from "antd";
import React from "react";
import { ReactNode } from "react-markdown/lib/react-markdown";
import styled from "styled-components";
interface Props {
    className?: string;
    children?: ReactNode;
    open: boolean;
    closeSidebar: () => void;
    width?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SidebarRight = ({
    className,
    children,
    open,
    width,
    closeSidebar
}: Props) => {
    return (
        <Drawer
            zIndex={9999}
            open={open}
            onClose={closeSidebar}
            placement="right"
            className={className}
            size="large"
            width={width}
        >
            <div className="p-3 md:p-6 h-[92vh] overflow-y-auto">
                {children}
            </div>
        </Drawer>
    );
};

export default styled(SidebarRight)`
    .ant-drawer-body {
        padding: 0 !important;

        ul {
            margin-top: 0 !important;
        }
    }

    .ant-drawer-header-title {
        justify-content: right;
    }
`;
