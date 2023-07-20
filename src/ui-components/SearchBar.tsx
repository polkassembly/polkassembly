// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SearchOutlined } from '@ant-design/icons';
import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { useNetworkContext } from '~src/context';
import ClientOnly, { Search } from './ClientOnly';
import NewSearch from 'src/components/Search';
import { Modal } from 'antd';
import { allowedNetwork } from '~src/components/Search';
import { poppins } from 'pages/_app';

interface ISearchBarProps {
    className?: string;
    isSmallScreen?: boolean;
}

const SearchBar: FC<ISearchBarProps> = (props) => {
    const { className, isSmallScreen } = props;
    const { network } = useNetworkContext();
    const [open, setOpen] = useState(false);
    const [isSuperSearch, setIsSuperSearch] = useState<boolean>(false);

    return allowedNetwork.includes(network.toUpperCase()) ? (
        <div className={className}>
            {isSmallScreen ? (
                <div className="small-client relative ">
                    <SearchOutlined className="absolute top-[11px] left-2.5 z-50" />
                    <NewSearch
                        openModal={open}
                        setOpenModal={setOpen}
                        isSuperSearch={isSuperSearch}
                        setIsSuperSearch={setIsSuperSearch}
                    />
                </div>
            ) : (
                <>
                    <div
                        className="flex items-center gap-1 max-sm:gap-0 cursor-pointer"
                        onClick={() => setOpen(true)}
                    >
                        <button className="flex items-center justify-center outline-none border-none bg-transparent cursor-pointer text-[18px] text-[#485F7D]">
                            <SearchOutlined />
                        </button>
                        <span className="bg-[#407AFC] py-0.5 px-2 text-[10px] font-semibold max-sm:hidden text-white rounded-full">
                            New
                        </span>
                        <span className="-mt-3 text-[#407AFC] text-[16px] sm:hidden">
                            &#9679;
                        </span>
                    </div>
                    <NewSearch
                        openModal={open}
                        setOpenModal={setOpen}
                        isSuperSearch={isSuperSearch}
                        setIsSuperSearch={setIsSuperSearch}
                    />
                </>
            )}
        </div>
    ) : (
        <div className={className}>
            {isSmallScreen ? (
                <div className="small-client relative">
                    <SearchOutlined className="absolute top-[11px] left-2.5 z-50" />
                    <ClientOnly>
                        <Search network={network} />
                    </ClientOnly>
                </div>
            ) : (
                <>
                    <button
                        className="flex items-center justify-center outline-none border-none bg-transparent cursor-pointer text-[18px] text-[#485F7D]"
                        onClick={() => setOpen(true)}
                    >
                        <SearchOutlined />
                    </button>
                    <Modal
                        title="Search"
                        closable={false}
                        open={open}
                        onCancel={() => setOpen(false)}
                        footer={[]}
                        className={`${className} ${poppins.className} ${poppins.variable}`}
                    >
                        <div className="client">
                            <ClientOnly>
                                <Search network={network} />
                            </ClientOnly>
                        </div>
                    </Modal>
                </>
            )}
        </div>
    );
};

export default styled(SearchBar)`
    .small-client .gsc-input-box {
        padding: 0px !important;
        margin: 0px !important;
        border: none !important;
        width: 100% !important;
    }
    .small-client .gsc-input input {
        background-color: white !important;
        border: 1px solid #d2d8e0 !important;
        height: 34px !important;
    }
    .small-client .gsc-control-cse {
        padding: 0px !important;
        border: none !important;
    }
    .small-client .gsc-search-box {
        margin: 0px !important;
    }
    .small-client .gsc-input {
        padding: 0px !important;
    }

    .small-client .gsc-search-button {
        background-color: white !important;
    }

    .small-client .gsc-search-button-v2 {
        background-color: var(--pink_primary) !important;
        cursor: pointer !important;
        border: none !important;
        margin: 0px !important;
        padding: 11px 15px !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        border-top-left-radius: 0px !important;
        border-top-right-radius: 0px !important;
    }
    .small-client .gsc-results-wrapper-overlay {
        top: 100px !important;
    }
    .client .gsc-control-cse {
        padding: 0px !important;
        border: none !important;
    }
    .client .gsc-search-box {
        margin: 0px !important;
    }
    .client .gsc-input {
        padding: 0px !important;
    }

    .client .gsc-search-button {
        background-color: white !important;
    }

    .client .gsc-search-button-v2 {
        background-color: var(--pink_primary) !important;
        cursor: pointer !important;
        border: none !important;
        margin: 0px !important;
        padding: 11px 15px !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        border-top-left-radius: 0px !important;
        border-top-right-radius: 0px !important;
    }
    .client .gsc-results-wrapper-overlay {
        top: 100px !important;
    }
    .ant-modal-footer {
        margin: 0px !important;
    }
`;
