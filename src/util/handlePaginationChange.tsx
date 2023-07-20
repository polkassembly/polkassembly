// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

interface Args {
    limit: number;
    page: number;
    setOffset?: (value: React.SetStateAction<number>) => void;
}
export const handlePaginationChange = ({ limit, page, setOffset }: Args) => {
    if (typeof window !== 'undefined') {
        window.scrollTo(0, 300);
    }
    setOffset?.(Math.ceil(limit * (page - 1)));
};
