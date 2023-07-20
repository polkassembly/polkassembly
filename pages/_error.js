// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable */

import * as Sentry from '@sentry/nextjs';
import NextErrorComponent from 'next/error';

const CustomErrorComponent = (props) => {
    // If you're using a Nextjs version prior to 12.2.1, uncomment this to
    // compensate for https://github.com/vercel/next.js/issues/8592
    // Sentry.captureUnderscoreErrorException(props);
    /* eslint-disable-next-line react/prop-types */
    return <NextErrorComponent statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = async (contextData) => {
    // In case this is running in a serverless function, await this in order to give Sentry
    // time to send the error before the lambda exits
    await Sentry.captureUnderscoreErrorException(contextData);

    // This will contain the status code of the response
    return NextErrorComponent.getInitialProps(contextData);
};

export default CustomErrorComponent;
