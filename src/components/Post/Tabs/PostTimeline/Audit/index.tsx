// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from "react";
import { ClockCircleOutlined } from "@ant-design/icons";
import { Radio } from "antd";
import CautionSVG from "~assets/icons/caution.svg";
import YouTubeIcon from "~assets/icons/video.svg";
import PdfIcon from "~assets/icons/pdfs.svg";
import PdfViewer from "./PdfViewer";
import VideoViewer from "./VideoViewer";
import NoAuditReport from "./NoAuditReport";
import ImageViewer from "./ImageViewer";

export interface IDataType {
    download_url: string;
    url: string;
    git_url: string;
    html_url: string;
    name: string;
    sha: number;
    size: number;
    type: string;
    _links: {
        self: string;
        git: string;
        html: string;
    };
}

export interface IDataVideoType {
    name: string;
    url: string;
    title: string;
    date: string;
}
// For showing date
function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear().toString().substr(-2);

    return `${day}${getOrdinalSuffix(day)} ${month} '${year}`;
}

function getOrdinalSuffix(day: number): string {
    const suffixes = ["th", "st", "nd", "rd"];
    const relevantDigits = day % 100;
    const suffix =
        suffixes[(relevantDigits - 20) % 10] ||
        suffixes[relevantDigits] ||
        suffixes[0];

    return suffix;
}
interface Props {
    auditData: IDataType[];
    videoData: IDataVideoType[];
}

const PostAudit = ({ auditData, videoData }: Props) => {
    const [selectedType, setSelectedType] = useState<string>("reports");
    const handleChange = (e: any) => {
        setSelectedType(e.target.value);
    };
    const pdfCount = auditData?.filter(
        (file: any) => file.name.endsWith(".pdf") || file.name.endsWith(".png")
    ).length;

    useEffect(() => {
        const pdfCount = auditData?.filter(
            (file: any) =>
                file.name.endsWith(".pdf") || file.name.endsWith(".png")
        ).length;
        const selectedValue = pdfCount === 0 ? "videos" : "reports";
        setSelectedType(selectedValue);
    }, [auditData, videoData]);
    return (
        <div className="min-h-[400px]">
            {
                <>
                    {pdfCount || videoData.length ? (
                        <div className="flex items-center gap-x-[11px] p-[15px] rounded-[6px] bg-[#E6F4FF] mt-3">
                            <span className="flex items-center justify-center">
                                <CautionSVG />
                            </span>
                            <p className="m-0 font-normal text-sm leading-[21px] text-[#243A57]">
                                The reports provided here does not represent
                                Polkassembly&apos;s views and we do not endorse
                                them.
                            </p>
                        </div>
                    ) : (
                        <NoAuditReport />
                    )}
                    <div className="mt-4">
                        <Radio.Group
                            className="flex m-0"
                            onChange={handleChange}
                            value={selectedType}
                        >
                            {pdfCount !== 0 && (
                                <Radio
                                    value="reports"
                                    className={`${
                                        selectedType === "reports"
                                            ? "bg-pink-50"
                                            : "bg-transparent"
                                    } rounded-full flex items-center px-4 py-[7px]`}
                                >
                                    <div className="flex items-center">
                                        <PdfIcon className="bg-cover bg-no-repeat bg-center" />
                                        <span className="text-[#243A57] pl-1">
                                            <span className="hidden md:inline-block">
                                                Reports
                                            </span>{" "}
                                            ({pdfCount})
                                        </span>
                                    </div>
                                </Radio>
                            )}
                            {videoData.length !== 0 && (
                                <Radio
                                    value="videos"
                                    className={`${
                                        selectedType === "videos"
                                            ? "bg-pink-50"
                                            : "bg-transparent"
                                    } rounded-full flex items-center px-4 py-[7px]`}
                                >
                                    <div className="flex items-center">
                                        <YouTubeIcon className="bg-cover bg-no-repeat bg-center" />
                                        <span className="text-[#243A57] pl-1">
                                            <span className="hidden md:inline-block">
                                                Videos
                                            </span>{" "}
                                            ({videoData.length})
                                        </span>
                                    </div>
                                </Radio>
                            )}
                        </Radio.Group>
                    </div>
                    {selectedType === "reports" && pdfCount > 0 ? (
                        <section>
                            {auditData
                                .filter(
                                    (item) =>
                                        item.name.endsWith(".pdf") ||
                                        item.name.endsWith(".png")
                                )
                                .map((item, index) => {
                                    const date = formatDate(
                                        item.name.split(" - ")[1]
                                    );
                                    return (
                                        <article
                                            key={item.sha}
                                            className={`flex flex-col gap-y-6 py-[26px] ${
                                                index !== 0
                                                    ? "border-0 border-t border-solid border-[#D2D8E0]"
                                                    : ""
                                            }`}
                                        >
                                            <p className="text-[#485F7D] m-0 text-sm leading-[18px] font-normal flex items-center gap-x-2">
                                                <span>
                                                    {item.name.split(" - ")[0]}
                                                </span>
                                                {date.includes("NaN") ? null : (
                                                    <>
                                                        {" "}
                                                        |
                                                        <ClockCircleOutlined />
                                                        <span>{date}</span>
                                                    </>
                                                )}
                                            </p>
                                            {item.name.endsWith(".pdf") ? (
                                                <PdfViewer item={item} />
                                            ) : item.name.endsWith(".png") ? (
                                                <ImageViewer item={item} />
                                            ) : null}
                                        </article>
                                    );
                                })}
                        </section>
                    ) : (
                        <></>
                    )}
                    {selectedType === "videos" && videoData.length > 0 ? (
                        <section>
                            {videoData.map((item, index) => (
                                <article
                                    key={item.title}
                                    className={`flex flex-col gap-y-6 py-[26px] ${
                                        index !== 0
                                            ? "border-0 border-t border-solid border-[#D2D8E0]"
                                            : ""
                                    }`}
                                >
                                    <p className="text-[#485F7D] m-0 text-sm leading-[18px] font-normal flex items-center gap-x-2">
                                        <span>{item.name}</span> |
                                        <ClockCircleOutlined />
                                        <span>{formatDate(item.date)}</span>
                                    </p>
                                    <VideoViewer item={item} />
                                </article>
                            ))}
                        </section>
                    ) : null}
                </>
            }
        </div>
    );
};

export default PostAudit;
