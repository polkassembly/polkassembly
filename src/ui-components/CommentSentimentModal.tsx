// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from "react";
import { Button, Modal, Slider } from "antd";
import { poppins } from "pages/_app";
import styled from "styled-components";
import { CheckOutlined } from "@ant-design/icons";
import CloseIcon from "public/assets/icons/sentiment-close.svg";

enum ESentiment {
    Against = 1,
    SlightlyAgainst = 2,
    Neutral = 3,
    SlightlyFor = 4,
    For = 5
}

interface Props {
    setIsComment: (pre: boolean) => void;
    openModal: boolean;
    setModalOpen: (pre: boolean) => void;
    setIsSentimentPost: (pre: boolean) => void;
    className?: string;
    setSentiment: (pre: number) => void;
    sentiment: number | 0;
}

const CommentSentimentModal = ({
    setIsComment,
    openModal,
    setModalOpen,
    setIsSentimentPost,
    className,
    sentiment,
    setSentiment
}: Props) => {
    const handleClick = () => {
        setIsSentimentPost(true);
        setIsComment(true);
        setModalOpen(false);
    };

    const handleSentimentText = () => {
        switch (sentiment) {
            case 1:
                return "Completely Against";
            case 2:
                return "Slightly Against";
            case 3:
                return "Neutral";
            case 4:
                return "Slightly For";
            case 5:
                return "Completely For";
            default:
                return "Neutral";
        }
    };

    return (
        <Modal
            open={openModal}
            wrapClassName={`${className}  sentiment_${sentiment}`}
            className={`${poppins.variable} ${poppins.className} max-w-full shrink-0 w-[433px] max-sm:w-[100%] padding justify-center center-aligned`}
            onCancel={() => {
                setModalOpen(false);
                setIsComment(true);
                setIsSentimentPost(false);
            }}
            maskClosable={false}
            centered
            footer={[
                <div className="flex items-center justify-center" key={1}>
                    <Button
                        onClick={handleClick}
                        className="bg-green-400 border-green-400 text-white font-medium flex items-center t-xs"
                    >
                        Done
                        <CheckOutlined />
                    </Button>
                </div>
            ]}
            closeIcon={<CloseIcon />}
            zIndex={1002}
        >
            <div className="pl-5 pr-5 text-base font-medium justify-center center-aligned flex flex-col items-center text-[#334D6E]">
                <h5 className="text-center mt-3">
                    Thank you for commenting on the post.
                    <br />
                    Move the slider to add your sentiment towards the
                    discussion.
                </h5>
                <Slider
                    style={{ width: "100%" }}
                    className={`w-full text-[12px] mt-[32px] sentiment_${sentiment}`}
                    trackStyle={{ backgroundColor: "#FF49AA" }}
                    onChange={(value: number) => setSentiment(value)}
                    step={5}
                    marks={{
                        1: { label: <span></span> },
                        2: { label: <span></span> },
                        3: { label: <span></span> },
                        4: { label: <span></span> },
                        5: { label: <span></span> }
                    }}
                    min={1}
                    max={5}
                    defaultValue={3}
                />
                <h5 className="text-sm font-medium text-pink_primary mb-[16px]">
                    {handleSentimentText()}
                </h5>
            </div>
        </Modal>
    );
};
export default styled(CommentSentimentModal).attrs(({ sentiment }: Props) => ({
    className: sentiment
}))`
    .padding .ant-modal-content {
        border-radius: 4px !important;
        padding: 40px 50px !important;
        text-align: center;
        justify-content: center;
        // color:#334D6E !important;
    }
    .padding .ant-slider-dot {
        border-color: #fce5f2 !important;
    }
    .padding .ant-slider-dot-active {
        border-color: #ff49aa !important;
    }
    .padding .ant-tooltip-open {
        border-color: #5c74fc !important;
    }

    .padding .ant-slider .ant-slider-rail {
        background-color: #fce5f2;
    }
    .padding .ant-slider .ant-slider-handle:focus::after {
        box-shadow: none;
    }

    .sentiment_${ESentiment.Against} {
        .ant-slider-handle::after {
            height: 32px;
            margin-top: -10px;
            width: 32px;
            background-image: url("/assets/icons/against.svg") !important;
            box-shadow: none;
            background-color: transparent;
            margin-left: -5px;
        }
    }
    .sentiment_${ESentiment.SlightlyAgainst} {
        .ant-slider-handle::after {
            height: 32px;
            margin-top: -10px;
            width: 32px;
            background-image: url("/assets/icons/slightly-against.svg") !important;
            box-shadow: none;
            background-color: transparent;
            margin-left: -2px;
        }
    }

    .sentiment_${ESentiment.Neutral} {
        .ant-slider-handle::after {
            height: 32px;
            margin-top: -10px;
            width: 32px;
            background-image: url("/assets/icons/neutral.svg") !important;
            box-shadow: none;
            background-color: transparent;
            margin-left: -2px;
        }
    }

    .sentiment_${ESentiment.SlightlyFor} {
        .ant-slider-handle::after {
            height: 32px;
            margin-top: -10px;
            width: 32px;
            background-image: url("/assets/icons/slightly-for.svg") !important;
            box-shadow: none;
            background-color: transparent;
            margin-left: -2px;
        }
    }

    .sentiment_${ESentiment.For} {
        .ant-slider-handle::after {
            height: 33px;
            margin-top: -11px;
            width: 33px;
            background-image: url("/assets/icons/for.svg") !important;
            box-shadow: none;
            background-color: transparent;
            margin-left: -2px;
        }
    }
`;
