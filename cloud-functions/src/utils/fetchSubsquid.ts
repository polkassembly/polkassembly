// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import axios from 'axios';

const subsquidUrlMap = {
    kusama: 'https://squid.subsquid.io/kusama-polkassembly/graphql',
    polkadot: 'https://squid.subsquid.io/polkadot-polkassembly/graphql',
    moonbeam: 'https://squid.subsquid.io/moonbeam-polkassembly/graphql',
    moonriver: 'https://squid.subsquid.io/moonriver-polkassembly/graphql',
    vara: 'https://squid.subsquid.io/vara-polkassembly/graphql',
};

interface Args {
    query: string;
    variables?: any;
    network: string;
}

export default async function fetchSubsquid({
    query,
    variables,
    network,
}: Args) {
    const body = variables ? { query, variables } : { query };

    if (!(network in subsquidUrlMap)) return;

    const subsquidUrl = subsquidUrlMap[network as keyof typeof subsquidUrlMap];
    return axios
        .post(`${subsquidUrl}`, {
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then((result) => result)
        .catch((e) => {
            console.error('error in fetchSubsquid : ', e);
        });
}
