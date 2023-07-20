// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import 'react-big-calendar/lib/css/react-big-calendar.css';

import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { dayjs } from 'dayjs-init';
import React, { useEffect } from 'react';

function CustomToolbarMini(props: any) {
    function addMonths(date: any, months: any) {
        const d = date.getDate();
        date.setMonth(date.getMonth() + months);
        if (date.getDate() != d) {
            date.setDate(0);
        }

        // setSelectedMonth(date.getMonth());
        return date;
    }

    const goToBack = () => {
        props.onNavigate('prev', addMonths(props.date, -1));
    };

    const goToNext = () => {
        props.onNavigate('next', addMonths(props.date, +1));
    };

    useEffect(() => {
        // setSelectedMonth(props.date.getMonth());
        const now = new Date();
        props.date.setMonth(props.date.getMonth());
        props.date.setYear(now.getFullYear());
        props.onNavigate('current');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        props.date && (
            <div className="flex justify-between items-center mb-3 px-3 ">
                <LeftOutlined
                    onClick={goToBack}
                    className="text-md cursor-pointer hover:text-sidebarBlue font-medium hover:font-bold"
                />
                <span className=" font-medium mx-3 text-sidebarBlue">
                    {dayjs(props.date).format('MMMM YYYY')}
                </span>
                <RightOutlined
                    onClick={goToNext}
                    className="text-md cursor-pointer hover:text-sidebarBlue font-medium hover:font-bold"
                />
            </div>
        )
    );
}

export default CustomToolbarMini;
