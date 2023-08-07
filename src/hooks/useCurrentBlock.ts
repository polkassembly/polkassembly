// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from "bn.js";
import { useContext, useEffect, useMemo, useState } from "react";
import { ApiContext } from "src/context/ApiContext";

export default function useCurrentBlock() {
    const [currentBlock, setCurrentBlock] = useState<BN | undefined>(undefined);
    const { api, apiReady } = useContext(ApiContext);

    useEffect(() => {
        if (!api) {
            return;
        }

        if (!apiReady) {
            return;
        }

        let unsubscribe: () => void;

        api.derive.chain
            .bestNumber((number) => {
                setCurrentBlock(number);
            })
            .then((unsub) => {
                unsubscribe = unsub;
            })
            .catch((e) => console.error(e));

        return () => unsubscribe && unsubscribe();
    }, [api, apiReady]);

    return useMemo(() => {
        return currentBlock;
    }, [currentBlock]);
}
