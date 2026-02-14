// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Error from 'next/error';

const CustomErrorComponent = (props) => {
	// eslint-disable-next-line react/prop-types
	return <Error statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = async (contextData) => {
	return Error.getInitialProps(contextData);
};

export default CustomErrorComponent;
