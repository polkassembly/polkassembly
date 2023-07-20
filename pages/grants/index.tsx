// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
import { GetServerSideProps } from 'next';
import { getOffChainPosts } from 'pages/api/v1/listing/off-chain-posts';
import { IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import { FC, useContext, useEffect, useState } from 'react';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import OffChainPostsContainer from '~src/components/Listing/OffChain/OffChainPostsContainer';
import { useNetworkContext } from '~src/context';
import { UserDetailsContext } from '~src/context/UserDetailsContext';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { OffChainProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { sortValues } from '~src/global/sortOptions';
import { ErrorState } from '~src/ui-components/UIStates';
import ReferendaLoginPrompts from '~src/ui-components/RefendaLoginPrompts';
import { useRouter } from 'next/router';

interface IGrantsProps {
    data?: IPostsListingResponse;
    error?: string;
    network: string;
}

export const getServerSideProps: GetServerSideProps = async ({
    req,
    query,
}) => {
    const { page = 1, sortBy = sortValues.NEWEST, filterBy } = query;

    if (
        !Object.values(sortValues).includes(sortBy.toString()) ||
        (filterBy &&
            filterBy.length !== 0 &&
            !Array.isArray(JSON.parse(decodeURIComponent(String(filterBy)))))
    ) {
        return {
            redirect: {
                destination: `/grants?page=${page}&sortBy=${sortValues.NEWEST}&filterBy=${filterBy}`,
                permanent: false,
            },
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const network = getNetworkFromReqHeaders(req.headers);

    const { data, error = '' } = await getOffChainPosts({
        filterBy:
            filterBy &&
            Array.isArray(JSON.parse(decodeURIComponent(String(filterBy))))
                ? JSON.parse(decodeURIComponent(String(filterBy)))
                : [],
        listingLimit: LISTING_LIMIT,
        network,
        page: Number(page),
        proposalType: OffChainProposalType.GRANTS,
        sortBy: String(sortBy),
    });

    return {
        props: {
            data,
            error,
            network,
        },
    };
};

const Grants: FC<IGrantsProps> = (props) => {
    const { data, error, network } = props;
    const { setNetwork } = useNetworkContext();
    const [openModal, setModalOpen] = useState<boolean>(false);

    useEffect(() => {
        setNetwork(props.network);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { id } = useContext(UserDetailsContext);
    const router = useRouter();

    if (error) return <ErrorState errorMessage={error} />;
    if (!data) return null;
    const { posts, count } = data;

    const handleClick = () => {
        if (id) {
            router.push('/grant/create');
        } else {
            setModalOpen(true);
        }
    };

    return (
        <>
            <SEOHead title="Discussions" network={network} />
            <div className="w-full flex flex-col sm:flex-row sm:items-center">
                <h1 className="dashboard-heading flex-1 mb-4 sm:mb-0">
                    Grants Discussion
                </h1>
                <Button
                    onClick={handleClick}
                    className="outline-none border-none h-[59px] w-[174px] px-6 py-4 font-medium text-lg leading-[27px] tracking-[0.01em] shadow-[0px_6px_18px_rgba(0,0,0,0.06)] flex items-center justify-center rounded-[4px] text-white bg-pink_primary cursor-pointer"
                >
                    New Grant post
                </Button>
            </div>

            {/* Intro and Create Post Button */}
            <div className="flex flex-col md:flex-row mt-8">
                <p className="text-sidebarBlue text-sm md:text-base font-medium bg-white p-4 md:p-8 rounded-md w-full shadow-md mb-4">
                    This is the place to discuss grants for {network}. Anyone
                    can start a new grants discussion.{' '}
                    <a
                        className="text-pink_primary"
                        href="https://github.com/moonbeam-foundation/grants/blob/main/interim/interim_grant_proposal.md"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Guidelines of the Interim Grants Program.
                    </a>
                </p>
            </div>

            <OffChainPostsContainer
                proposalType={OffChainProposalType.GRANTS}
                posts={posts}
                count={count}
                className="mt-8"
            />
            <ReferendaLoginPrompts
                modalOpen={openModal}
                setModalOpen={setModalOpen}
                image="/assets/referenda-discussion.png"
                title="Join Polkassembly to Start a New Discussion."
                subtitle="Discuss, contribute and get regular updates from Polkassembly."
            />
        </>
    );
};

export default Grants;
