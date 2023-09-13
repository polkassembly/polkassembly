// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Poppins, Roboto_Mono, Work_Sans } from 'next/font/google';
import { ConfigProvider } from 'antd';
import type { AppProps } from 'next/app';
import Image from 'next/image';
import { useRouter } from 'next/router';
import NextNProgress from 'nextjs-progressbar';
import { useEffect, useState } from 'react';
import AppLayout from 'src/components/AppLayout';
import CMDK from 'src/components/CMDK';
import { UserDetailsProvider } from 'src/context/UserDetailsContext';
import { antdTheme } from 'styles/antdTheme';

import { ApiContextProvider } from '~src/context/ApiContext';
import { ModalProvider } from '~src/context/ModalContext';
import { NetworkContextProvider } from '~src/context/NetworkContext';
import getNetwork from '~src/util/getNetwork';
import { initGA, logPageView } from '../analytics';
import 'antd/dist/reset.css';
import '../styles/globals.css';
import ErrorBoundary from '~src/ui-components/ErrorBoundary';
import { ThemeProvider, useTheme } from 'next-themes';

export const poppins = Poppins({
	adjustFontFallback: false,
	display: 'swap',
	style: ['italic', 'normal'],
	subsets: ['latin'],
	variable: '--font-poppins',
	weight: ['200', '300', '400', '500', '600', '700']
});
const robotoMono = Roboto_Mono({
	display: 'swap',
	style: 'normal',
	subsets: ['latin'],
	weight: ['400', '500']
});
const workSans = Work_Sans({
	display: 'swap',
	subsets: ['latin']
});

export default function App({ Component, pageProps }: AppProps) {
	const router = useRouter();
	const [showSplashScreen, setShowSplashScreen] = useState(true);
	const [network, setNetwork] = useState<string>('');
	const { resolvedTheme } = useTheme();
	useEffect(() => {
		router.isReady && setShowSplashScreen(false);
	}, [router.isReady]);

	useEffect(() => {
		if (!global?.window) return;
		const networkStr = getNetwork();
		setNetwork(networkStr);

		if (!window.GA_INITIALIZED) {
			initGA();
			// @ts-ignore
			window.GA_INITIALIZED = true;
		}
		logPageView();
	}, []);

	const SplashLoader = () => <div style={{ background: '#F5F5F5', minHeight: '100vh', minWidth: '100vw' }}>
		<Image
			style={{ left: 'calc(50vw - 16px)', position: 'absolute', top: 'calc(50vh - 16px)' }}
			width={32}
			height={32}
			src='/favicon.ico'
			alt={'Loading'}
		/>
	</div>;

	return <ConfigProvider theme={antdTheme}>
		<ThemeProvider attribute='class'>
			<ModalProvider>
				<ErrorBoundary>
					<UserDetailsProvider>
						<ApiContextProvider network={network}>
							<NetworkContextProvider initialNetwork={network}>
								<>
									{ showSplashScreen && <SplashLoader /> }
									<main className={`${poppins.variable} ${poppins.className} ${robotoMono.className} ${workSans.className} ${showSplashScreen ? 'hidden' : ''}`}>
										<NextNProgress color="#E5007A" />
										<CMDK />
										<AppLayout theme={resolvedTheme} Component={Component} pageProps={pageProps} />
									</main>
								</>
							</NetworkContextProvider>
						</ApiContextProvider>
					</UserDetailsProvider>
				</ErrorBoundary>
			</ModalProvider>
		</ThemeProvider>
	</ConfigProvider>;
}
