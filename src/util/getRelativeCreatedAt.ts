// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from "dayjs-init";

export default function getRelativeCreatedAt(created_at?: Date) {
    return created_at
        ? dayjs(created_at).isAfter(dayjs().subtract(1, "w"))
            ? dayjs(created_at).fromNow()
            : dayjs(created_at).format("Do MMM 'YY")
        : null;
}
