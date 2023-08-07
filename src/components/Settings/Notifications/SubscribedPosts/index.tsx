// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from "react";
import { Switch } from "antd";
import ExpandIcon from "~assets/icons/expand.svg";
import CollapseIcon from "~assets/icons/collapse.svg";
import SubscribedPostsNotification from "~assets/icons/subscribed-posts-notification-icon.svg";
import GroupCheckbox from "../common-ui/GroupCheckbox";
import { ACTIONS } from "../Reducer/action";
import { Collapse } from "../common-ui/Collapse";

const { Panel } = Collapse;
type Props = {
    onSetNotification: any;
    dispatch: any;
    options: any;
    userNotification: any;
};

export default function SubscribedPosts({
    onSetNotification,
    dispatch,
    options,
    userNotification
}: Props) {
    const [active, setActive] = useState<boolean | undefined>(false);
    const [all, setAll] = useState(false);

    useEffect(() => {
        setAll(options.every((category: any) => category.selected));
    }, [options]);

    const handleAllClick = (checked: boolean) => {
        dispatch({
            payload: {
                params: { checked }
            },
            type: ACTIONS.SUBSCRIBED_PROPOSAL_ALL_CHANGE
        });
        const notification = Object.assign({}, userNotification);
        options.forEach((option: any) => {
            const trigger = option.triggerPreferencesName;
            let subTriggers =
                notification?.[option.triggerName]?.sub_triggers || [];
            if (checked) {
                if (!subTriggers.includes(trigger)) subTriggers.push(trigger);
            } else {
                subTriggers = subTriggers.filter(
                    (postType: string) => postType !== trigger
                );
            }
            notification[option.triggerName] = {
                enabled: subTriggers.length > 0,
                name: option?.triggerPreferencesName,
                sub_triggers: subTriggers
            };
        });
        onSetNotification(notification);
        setAll(checked);
    };

    const handleChange = (
        categoryOptions: any,
        checked: boolean,
        value: string
    ) => {
        dispatch({
            payload: {
                params: { categoryOptions, checked, value }
            },
            type: ACTIONS.SUBSCRIBED_PROPOSAL_SINGLE_CHANGE
        });
        const notification = Object.assign({}, userNotification);
        const option = categoryOptions.find((opt: any) => opt.label === value);
        const trigger = option.triggerPreferencesName;
        let subTriggers =
            notification?.[option.triggerName]?.sub_triggers || [];
        if (checked) {
            if (!subTriggers.includes(trigger)) subTriggers.push(trigger);
        } else {
            subTriggers = subTriggers.filter(
                (postType: string) => postType !== trigger
            );
        }
        notification[option.triggerName] = {
            enabled: subTriggers.length > 0,
            name: option?.triggerPreferencesName,
            sub_triggers: subTriggers
        };
        onSetNotification(notification);
    };

    return (
        <Collapse
            size="large"
            className="bg-white"
            expandIconPosition="end"
            expandIcon={({ isActive }) => {
                setActive(isActive);
                return isActive ? <CollapseIcon /> : <ExpandIcon />;
            }}
        >
            <Panel
                header={
                    <div className="flex items-center gap-[6px] channel-header">
                        <SubscribedPostsNotification />
                        <h3 className="font-semibold text-[16px] text-[#243A57] md:text-[18px] tracking-wide leading-[21px] mb-0">
                            Subscribed Posts{" "}
                            <span className="hidden md:inline">
                                (Others proposals)
                            </span>
                        </h3>
                        {!!active && (
                            <>
                                <span className="flex gap-[8px] items-center">
                                    <Switch
                                        size="small"
                                        id="postParticipated"
                                        onChange={(checked, e) => {
                                            e.stopPropagation();
                                            handleAllClick(checked);
                                        }}
                                        checked={all}
                                    />
                                    <p className="m-0 text-[#485F7D]">All</p>
                                </span>
                            </>
                        )}
                    </div>
                }
                key="1"
            >
                <GroupCheckbox
                    categoryOptions={options}
                    onChange={handleChange}
                />
            </Panel>
        </Collapse>
    );
}
