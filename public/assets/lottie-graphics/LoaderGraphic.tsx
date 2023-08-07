// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { ReactElement } from "react";
import Lottie from "react-lottie-player";

import LoaderJson from "./lottie-files/loader.json";

interface Props {
    width?: number;
}

function LoaderGraphic({ width = 200 }: Props): ReactElement {
    return (
        <div>
            <Lottie
                animationData={LoaderJson}
                style={{
                    height: width,
                    left: "50%",
                    position: "absolute",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: width
                }}
                play={true}
            />
        </div>
    );
}

export default LoaderGraphic;
