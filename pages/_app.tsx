// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// import { dmSans, Roboto_Mono, Work_Sans, Space_Grotesk, DM_Sans } from 'next/font/google';
import { Roboto_Mono, Work_Sans, Space_Grotesk, DM_Sans } from 'next/font/google';
import { ConfigProvider } from 'antd';
import type { AppProps } from 'next/app';
import Image from 'next/image';
import { useRouter } from 'next/router';
import NextNProgress from 'nextjs-progressbar';
import { useEffect, useState } from 'react';
import AppLayout from 'src/components/AppLayout';
// import CMDK from 'src/components/CMDK';
import { antdTheme } from 'styles/antdTheme';

import { ApiContextProvider } from '~src/context/ApiContext';
import { ModalProvider } from '~src/context/ModalContext';
import getNetwork from '~src/util/getNetwork';
import { initGA, logPageView } from '../analytics';
import 'antd/dist/reset.css';
import '../styles/globals.css';
import ErrorBoundary from '~src/ui-components/ErrorBoundary';
import { PersistGate } from 'redux-persist/integration/react';
import { wrapper } from '~src/redux/store';
import { useStore } from 'react-redux';
import { chainProperties } from '~src/global/networkConstants';
import { ThemeProvider } from 'next-themes';
import { useTheme } from 'next-themes';
import { createGlobalStyle } from 'styled-components';
import { PeopleChainApiContextProvider } from '~src/context/PeopleChainApiContext';
import { appWithTranslation } from 'next-i18next';

export const dmSans = DM_Sans({
	adjustFontFallback: false,
	display: 'swap',
	style: ['italic', 'normal'],
	subsets: ['latin'],
	variable: '--font-dmSans',
	weight: ['400', '500', '700']
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
export const spaceGrotesk = Space_Grotesk({
	adjustFontFallback: false,
	display: 'swap',
	style: ['normal'],
	subsets: ['latin'],
	variable: '--font-space_grotesk',
	weight: ['300', '400', '500', '600', '700']
});

const GlobalStyle = createGlobalStyle`
  ::-webkit-scrollbar-track {
    background: ${(props: any) => (props.theme === 'dark' ? '#1D1D1D' : '#f1f1f1')};
  }
  ::-webkit-scrollbar-thumb {
    background: ${(props: any) => (props.theme === 'dark' ? '#3B444F' : '#888')};
  }
  ::-webkit-scrollbar-thumb:hover {
    background: ${(props: any) => (props.theme === 'dark' ? '#555' : '#555')};
  }
`;

function App({ Component, pageProps }: AppProps) {
	const router = useRouter();
	const store: any = useStore();
	const [showSplashScreen, setShowSplashScreen] = useState(true);
	const [network, setNetwork] = useState<string>('');

	useEffect(() => {
		router.isReady && setShowSplashScreen(false);
	}, [router.isReady]);

	useEffect(() => {
		const networkStr = getNetwork();
		setNetwork(networkStr);

		if (!global?.window || !chainProperties[networkStr].gTag) return;

		if (!window.GA_INITIALIZED) {
			initGA(networkStr);
			// @ts-ignore
			window.GA_INITIALIZED = true;
		}
		setNetwork(networkStr);
		logPageView();
	}, []);

	const SplashLoader = () => {
		return (
			<div
				style={{ background: '#000000', minHeight: '100vh', minWidth: '100vw' }}
				className='flex flex-col items-center justify-center gap-2'
			>
				<Image
					width={172}
					className='bg-transparent'
					height={57}
					src='/assets/PALogoDark.svg'
					alt={'Loading'}
				/>
			</div>
		);
	};

	const GlobalStyleWithTheme = () => {
		const { resolvedTheme: theme } = useTheme();
		return (
			<div>
				<GlobalStyle theme={theme} />
			</div>
		);
	};

	return (
		<PersistGate persistor={store.__persistor}>
			{() => (
				<ThemeProvider attribute='class'>
					<ConfigProvider theme={antdTheme}>
						<GlobalStyleWithTheme />
						<ModalProvider>
							<ErrorBoundary>
								<ApiContextProvider network={network}>
									<PeopleChainApiContextProvider network={network}>
										<>
											{showSplashScreen && <SplashLoader />}
											<main className={`${dmSans.variable} ${dmSans.className} ${robotoMono.className} ${workSans.className} ${showSplashScreen ? 'hidden' : ''}`}>
												<NextNProgress color='#E5007A' />
												{/* <CMDK /> */}
												<AppLayout
													Component={Component}
													pageProps={pageProps}
												/>
											</main>
										</>
									</PeopleChainApiContextProvider>
								</ApiContextProvider>
							</ErrorBoundary>
						</ModalProvider>
					</ConfigProvider>
				</ThemeProvider>
			)}
		</PersistGate>
	);
}

export default appWithTranslation(wrapper.withRedux(App)) as any;
