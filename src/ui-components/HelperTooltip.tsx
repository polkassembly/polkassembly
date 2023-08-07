// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InfoCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { TooltipPlacement } from "antd/es/tooltip";
import React, { ReactNode } from "react";

interface Props {
    className?: string;
    text: string | ReactNode;
    bgColor?: string;
    placement?: TooltipPlacement;
}

const HelperTooltip = ({
    className,
    text,
    bgColor = "#E5007A",
    placement
}: Props) => {
    return (
        <Tooltip
            placement={placement}
            color={bgColor}
            title={text}
            getPopupContainer={(triggerNode) => triggerNode}
        >
            <InfoCircleOutlined className={className} />
        </Tooltip>
    );
};

export default HelperTooltip;
