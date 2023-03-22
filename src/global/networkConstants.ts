// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import acalaLogo from '~assets/parachain-logos/acala-logo.jpg';
import acuityLogo from '~assets/parachain-logos/acuity-logo.jpg';
import altairLogo from '~assets/parachain-logos/altair-logo.jpeg';
import amplitudeLogo from '~assets/parachain-logos/amplitude-logo.png';
import astarLogo from '~assets/parachain-logos/astar-logo.png';
import automataLogo from '~assets/parachain-logos/automata-logo.jpg';
import basiliskLogo from '~assets/parachain-logos/basilisk-logo.jpg';
import pioneerLogo from '~assets/parachain-logos/bitcountrypioneer-logo.jpg';
import calamariLogo from '~assets/parachain-logos/calamari-logo.png';
import centrifugeLogo from '~assets/parachain-logos/centrifuge-logo.png';
import composableFinanceLogo from '~assets/parachain-logos/composable-finance-logo.png';
import crustLogo from '~assets/parachain-logos/crust-logo.png';
import equilibriumLogo from '~assets/parachain-logos/equilibrium-logo.png';
import frequencyRococoLogo from '~assets/parachain-logos/frequency-logo.png';
import frequencyLogo from '~assets/parachain-logos/frequency-logo.png';
import gearLogo from '~assets/parachain-logos/gear-logo.jpg';
import genshiroLogo from '~assets/parachain-logos/genshiro.png';
import gmordieLogo from '~assets/parachain-logos/gmordie-logo.png';
import heikoLogo from '~assets/parachain-logos/heiko-logo.png';
import hydradxLogo from '~assets/parachain-logos/hydradx-logo.jpg';
import karuraLogo from '~assets/parachain-logos/karura-logo.jpg';
import khalaLogo from '~assets/parachain-logos/khala-logo.png';
import kiltLogo from '~assets/parachain-logos/kilt-logo.png';
import kusamaLogo from '~assets/parachain-logos/kusama-logo.gif';
import kylinLogo from '~assets/parachain-logos/kylin-logo.png';
import mantaLogo from '~assets/parachain-logos/manta-logo.jpg';
import moonbaseLogo from '~assets/parachain-logos/moonbase-logo.png';
import moonbeamLogo from '~assets/parachain-logos/moonbeam-logo.png';
import moonriverLogo from '~assets/parachain-logos/moonriver-logo.png';
import myriadLogo from '~assets/parachain-logos/myriad-logo.png';
import parallelLogo from '~assets/parachain-logos/parallel-logo.jpg';
import pendulumLogo from '~assets/parachain-logos/pendulum-logo.png';
import picassoLogo from '~assets/parachain-logos/picasso-logo.png';
import pichiuLogo from '~assets/parachain-logos/pichiu-logo.png';
import polkadexLogo from '~assets/parachain-logos/polkadex-logo.jpg';
import polkadotLogo from '~assets/parachain-logos/polkadot-logo.jpg';
import polymeshLogo from '~assets/parachain-logos/polymesh-logo.png';
import robonomicsLogo from '~assets/parachain-logos/robonomics-logo.jpg';
import shidenLogo from '~assets/parachain-logos/shiden-logo.jpg';
import snowLogo from '~assets/parachain-logos/snow-logo.png';
import tanganikaLogo from '~assets/parachain-logos/tanganika-logo.png';
import tidechainLogo from '~assets/parachain-logos/tidechain-logo.png';
import turingLogo from '~assets/parachain-logos/turing-logo.png';
import varaLogo from '~assets/parachain-logos/vara-logo.png';
import westendLogo from '~assets/parachain-logos/westend-logo.jpg';
import xxcoinLogo from '~assets/parachain-logos/xxcoin-logo.png';

import * as types from '../types';

export const network = {
	POLKADOT: 'polkadot',
	KUSAMA: 'kusama',
	ACALA: 'acala',
	ACUITY: 'acuity',
	ALTAIR: 'altair',
	AMPLITUDE: 'amplitude',
	ASTAR: 'astar',
	AUTOMATA: 'automata',
	BASILISK: 'basilisk',
	CALAMARI: 'calamari',
	CENTRIFUGE: 'centrifuge',
	COMPOSABLE: 'composable',
	CRUST: 'crust',
	CRUSTSHADOW: 'crustshadow',
	EQUILIBRIUM: 'equilibrium',
	FREQUENCYROCOCO: 'frequency-rococo',
	FREQUENCY: 'frequency',
	GEAR: 'gear',
	GENSHIRO: 'genshiro',
	GMORDIE: 'gmordie',
	HEIKO: 'heiko',
	HYDRADX: 'hydradx',
	KARURA: 'karura',
	KHALA: 'khala',
	KILT: 'kilt',
	KYLIN: 'kylin',
	MANTA: 'manta',
	MOONBASE: 'moonbase',
	MOONBEAM: 'moonbeam',
	MOONRIVER: 'moonriver',
	MYRIAD: 'myriad',
	PARALLEL: 'parallel',
	PENDULUM: 'pendulum',
	PIONEER: 'pioneer',
	POLKADEX: 'polkadex',
	ROBONOMICS: 'robonomics',
	SNOW: 'snow',
	SHIBUYA: 'shibuya',
	SHIDEN: 'shiden',
	TANGANIKA: 'tanganika',
	TIDECHAIN: 'tidechain',
	PICASSO: 'picasso',
	PICHIU: 'pichiu',
	PICHIUROCOCO: 'pichiu-rococo',
	POLYMESH:'polymesh',
	POLYMESHTEST: 'polymesh-test',
	TINKER: 'tinker',
	TURING: 'turing',
	VARA: 'vara',
	WESTEND: 'westend',
	XX: 'xx'
};

export const tokenSymbol = {
	ACA: 'ACA',
	ACU: 'ACU',
	ASTR: 'ASTR',
	AMPE: 'AMPE',
	ATA: 'ATA',
	BNC: 'BNC',
	BSX: 'BSX',
	CFG: 'CFG',
	CRU: 'CRU',
	CSM: 'CSM',
	DOL: 'DOL',
	DEV: 'DEV',
	DHX: 'DHX',
	DOT: 'DOT',
	FREN: 'FREN',
	FRQCY: 'FRQCY',
	GLMR: 'GLMR',
	HDX: 'HDX',
	HKO: 'HKO',
	KAR: 'KAR',
	KHA: 'KHA',
	ICZ: 'ICZ',
	KILT: 'KILT',
	KMA: 'KMA',
	KSM: 'KSM',
	KYL: 'KYL',
	LAYR: 'LAYR',
	MOVR: 'MOVR',
	MYRIA: 'MYRIA',
	PARA: 'PARA',
	PCHU: 'PCHU',
	PDEX: 'PDEX',
	PEN: 'PEN',
	SBY: 'SBY',
	SDN: 'SDN',
	TDFY: 'TDFY',
	TUR: 'TUR',
	TOKEN: 'TOKEN',
	PICA: 'PICA',
	POLYX: 'POLYX',
	WND: 'WND',
	XRT: 'XRT',
	UNIT: 'UNIT',
	VARA: 'VARA',
	XX: 'XX'
};

export const chainProperties: types.ChainPropType = {
	[network.POLKADOT]: {
		blockTime: 6000,
		category: 'polkadot',
		chainId: 0,
		logo: polkadotLogo,
		rpcEndpoint: 'wss://rpc.ibp.network/polkadot',
		ss58Format: 0,
		subsquidUrl: 'https://squid.subsquid.io/polkadot-polkassembly/graphql',
		tokenDecimals: 10,
		tokenSymbol: tokenSymbol.DOT
	},
	[network.KUSAMA]: {
		blockTime: 6000,
		category: 'kusama',
		chainId: 0,
		logo: kusamaLogo,
		rpcEndpoint: 'wss://rpc.ibp.network/kusama',
		ss58Format: 2,
		subsquidUrl: 'https://squid.subsquid.io/kusama-polkassembly/graphql',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.KSM
	},
	[network.ACALA]:{
		blockTime: 12000,
		chainId: 0,
		logo: acalaLogo,
		category: 'polkadot',
		rpcEndpoint: 'wss://acala-polkadot.api.onfinality.io/public-ws',
		ss58Format: 10,
		tokenDecimals: 12,
		subsquidUrl: 'https://squid.subsquid.io/acala-polkassembly/graphql',
		tokenSymbol: tokenSymbol.ACA
	},
	[network.ACUITY]: {
		blockTime: 6000,
		category: 'solo',
		chainId: 0,
		logo: acuityLogo,
		rpcEndpoint: 'wss://freemont.acuity.social',
		ss58Format: 42,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.ACU
	},
	[network.ALTAIR]: {
		blockTime: 12000,
		category: 'kusama',
		chainId: 0,
		logo: altairLogo,
		rpcEndpoint: 'wss://altair.api.onfinality.io/public-ws',
		ss58Format: 136,
		subsquidUrl: '',
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.BNC
	},
	[network.AMPLITUDE]: {
		blockTime: 12000,
		category: 'kusama',
		chainId: 0,
		logo: amplitudeLogo,
		rpcEndpoint: 'wss://rpc-amplitude.pendulumchain.tech',
		ss58Format: 57,
		subsquidUrl: 'https://squid.subsquid.io/amplitude-polkassembly/graphql',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.AMPE
	},
	[network.ASTAR]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 592,
		logo: astarLogo,
		rpcEndpoint: 'wss://astar.api.onfinality.io/public-ws',
		ss58Format: 5,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.ASTR
	},
	[network.AUTOMATA]: {
		blockTime: 6000,
		category: 'solo',
		chainId: 0,
		logo: automataLogo,
		rpcEndpoint: 'wss://automata.api.onfinality.io/public-ws',
		ss58Format: 88,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.ATA
	},
	[network.BASILISK]: {
		blockTime: 12000,
		category: 'kusama',
		chainId: 2090,
		logo: basiliskLogo,
		rpcEndpoint: 'wss://basilisk.api.onfinality.io/public-ws',
		ss58Format: 10041,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.BSX
	},
	[network.PIONEER]: {
		blockTime: 12000,
		category: 'solo',
		chainId: 0,
		logo: pioneerLogo,
		rpcEndpoint: 'wss://pioneer.api.onfinality.io/public-ws',
		ss58Format: 6,
		subsquidUrl: '',
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.BNC
	},
	[network.CALAMARI]: {
		blockTime: 12000,
		category: 'kusama',
		chainId: 2084,
		logo: calamariLogo,
		rpcEndpoint: 'wss://calamari.api.onfinality.io/public-ws',
		ss58Format: 78,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.KMA
	},
	[network.CENTRIFUGE]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 0,
		logo: centrifugeLogo,
		rpcEndpoint: 'wss://centrifuge-parachain.api.onfinality.io/public-ws',
		ss58Format: 36,
		subsquidUrl: '',
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.CFG
	},
	[network.COMPOSABLE]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 0,
		logo: composableFinanceLogo,
		rpcEndpoint: 'wss://rpc.composable.finance',
		ss58Format: 49,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.LAYR
	},
	[network.CRUST]: {
		blockTime: 12000,
		category: 'solo',
		chainId: 0,
		logo: crustLogo,
		rpcEndpoint: 'wss://rpc.crust.network',
		ss58Format: 66,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.CRU
	},
	[network.CRUSTSHADOW]: {
		blockTime: 12000,
		category: 'kusama',
		chainId: 0,
		logo: crustLogo,
		rpcEndpoint: 'wss://rpc-shadow.crust.network',
		ss58Format: 66,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.CSM
	},
	[network.EQUILIBRIUM]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 0,
		logo: equilibriumLogo,
		rpcEndpoint: 'wss://node.pol.equilibrium.io/',
		ss58Format: 68,
		tokenDecimals: 9,
		tokenSymbol: tokenSymbol.TOKEN,
		subsquidUrl:'https://squid.subsquid.io/equilibrium-polkassembly/graphql'

	},
	[network.FREQUENCY]: {
		blockTime: 12000,
		category: 'test',
		chainId: 0,
		logo: frequencyLogo,
		rpcEndpoint: 'wss://0.rpc.frequency.xyz',
		ss58Format: 90,
		tokenDecimals: 8,
		tokenSymbol: tokenSymbol.FRQCY,
		subsquidUrl: ''
	},
	[network.FREQUENCYROCOCO]: {
		blockTime: 12000,
		category: 'test',
		chainId: 0,
		logo: frequencyRococoLogo,
		rpcEndpoint: 'wss://rpc.rococo.frequency.xyz/',
		ss58Format: 42,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.UNIT,
		subsquidUrl: ''
	},
	[network.GEAR]: {
		blockTime: 1000,
		category: 'solo',
		chainId: 0,
		logo: gearLogo,
		rpcEndpoint: 'wss://rpc-node.gear-tech.io:443',
		ss58Format: 42,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.UNIT
	},
	[network.GENSHIRO]: {
		blockTime: 6000,
		category: 'test',
		chainId: 0,
		logo: genshiroLogo,
		rpcEndpoint: 'wss://testnet.genshiro.io',
		ss58Format: 67,
		tokenDecimals: 9,
		tokenSymbol: tokenSymbol.TOKEN,
		subsquidUrl: ''
	},
	[network.GMORDIE]: {
		blockTime: 9000,
		category: 'test',
		chainId: 0,
		logo: gmordieLogo,
		rpcEndpoint: 'wss://kusama.gmordie.com',
		ss58Format: 42,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.FREN,
		subsquidUrl: ''
	},
	[network.HEIKO]: {
		blockTime: 13000,
		category: 'kusama',
		chainId: 0,
		logo: heikoLogo,
		rpcEndpoint: 'wss://heiko-rpc.parallel.fi',
		ss58Format: 63,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.HKO
	},
	[network.HYDRADX]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 0,
		logo: hydradxLogo,
		rpcEndpoint: 'wss://hydradx-rpc.dwellir.com',
		ss58Format: 63,
		subsquidUrl: '',
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.HDX
	},
	[network.KARURA]: {
		blockTime: 12000,
		category: 'kusama',
		chainId: 0,
		logo: karuraLogo,
		rpcEndpoint: 'wss://karura.api.onfinality.io/public-ws',
		ss58Format: 8,
		subsquidUrl: '',
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.KAR
	},
	[network.KYLIN]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 0,
		logo: kylinLogo,
		rpcEndpoint: 'wss://polkadot.kylin-node.co.uk',
		ss58Format: 42,
		subsquidUrl: '',
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.KYL
	},
	[network.KHALA]: {
		blockTime: 12000,
		category: 'kusama',
		chainId: 0,
		logo: khalaLogo,
		rpcEndpoint: 'wss://khala.api.onfinality.io/public-ws',
		ss58Format: 30,
		subsquidUrl: '',
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.KHA
	},
	[network.KILT]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 0,
		logo: kiltLogo,
		rpcEndpoint: 'wss://spiritnet.kilt.io/',
		ss58Format: 38,
		subsquidUrl: 'https://squid.subsquid.io/kilt-polkassembly/graphql',
		tokenDecimals: 15,
		tokenSymbol: tokenSymbol.KILT
	},
	[network.MANTA]: {
		blockTime: 12000,
		category: 'solo',
		chainId: 1287,
		logo: mantaLogo,
		rpcEndpoint: 'wss://ws.rococo.dolphin.engineering',
		ss58Format: 78,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.DOL
	},
	[network.MOONBASE]: {
		blockTime: 12000,
		category: 'test',
		chainId: 1287,
		logo: moonbaseLogo,
		rpcEndpoint: 'wss://wss.api.moonbase.moonbeam.network',
		ss58Format: 0,
		subsquidUrl: 'https://squid.subsquid.io/moonbase-polkassembly/graphql',
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.DEV
	},
	[network.SHIBUYA]: {
		blockTime: 12000,
		category: 'test',
		chainId: 81,
		logo: shidenLogo,
		rpcEndpoint: 'wss://shibuya-rpc.dwellir.com',
		subsquidUrl: '',
		ss58Format: 5,
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.SBY
	},
	[network.MOONBEAM]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 1284,
		logo: moonbeamLogo,
		rpcEndpoint: 'wss://wss.api.moonbeam.network',
		ss58Format: 1284,
		subsquidUrl: 'https://squid.subsquid.io/moonbeam-polkassembly/graphql',
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.GLMR
	},
	[network.MOONRIVER]: {
		blockTime: 12000,
		category: 'kusama',
		chainId: 1285,
		logo: moonriverLogo,
		rpcEndpoint: 'wss://wss.moonriver.moonbeam.network',
		ss58Format: 1285,
		subsquidUrl: 'https://squid.subsquid.io/moonriver-polkassembly/graphql',
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.MOVR
	},
	[network.MYRIAD]: {
		blockTime: 6000,
		category: 'solo',
		chainId: 0,
		logo: myriadLogo,
		rpcEndpoint: 'wss://ws-rpc.myriad.social',
		ss58Format: 42,
		subsquidUrl: 'https://squid.subsquid.io/myriad-polkassembly/graphql',
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.MYRIA
	},
	[network.PARALLEL]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 172,
		logo: parallelLogo,
		rpcEndpoint: 'wss://rpc.parallel.fi',
		ss58Format: 172,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.PARA
	},
	[network.PENDULUM]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 0,
		logo: pendulumLogo,
		rpcEndpoint: 'wss://rpc-pendulum.prd.pendulumchain.tech:443',
		ss58Format: 56,
		subsquidUrl: 'https://squid.subsquid.io/pendulum-polkassembly/graphql',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.PEN
	},
	[network.POLKADEX]: {
		blockTime: 12000,
		category: 'solo',
		chainId: 0,
		logo: polkadexLogo,
		rpcEndpoint: 'wss://polkadex.api.onfinality.io/public-ws',
		ss58Format: 88,
		subsquidUrl: 'https://squid.subsquid.io/polkadex-polkassembly/graphql',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.PDEX
	},
	[network.POLYMESH]: {
		blockTime: 6000,
		category: 'solo',
		chainId: 0,
		logo: polymeshLogo,
		rpcEndpoint: 'wss://mainnet-rpc.polymesh.network',
		ss58Format: 12,
		tokenDecimals: 6,
		tokenSymbol: tokenSymbol.POLYX,
		subsquidUrl: ''
	},
	[network.POLYMESHTEST]: {
		blockTime: 6000,
		category: 'test',
		chainId: 0,
		logo: polymeshLogo,
		rpcEndpoint: 'wss://testnet-rpc.polymesh.live',
		ss58Format: 42,
		tokenDecimals: 6,
		tokenSymbol: tokenSymbol.POLYX,
		subsquidUrl: ''
	},
	[network.PICASSO]: {
		blockTime: 12000,
		category: 'kusama',
		chainId: 0,
		logo: picassoLogo,
		rpcEndpoint: 'wss://picasso-rpc.composable.finance',
		ss58Format: 49,
		subsquidUrl: 'https://squid.subsquid.io/picasso-polkassembly/graphql',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.PICA
	},
	[network.PICHIUROCOCO]: {
		blockTime: 12000,
		category: 'test',
		chainId: 172,
		logo: kylinLogo,
		rpcEndpoint: 'wss://pichiu-rococo-01.onebitdev.com',
		ss58Format: 42,
		tokenDecimals: 18,
		subsquidUrl: '',
		tokenSymbol: tokenSymbol.PCHU
	},
	[network.PICHIU]: {
		blockTime: 12000,
		category: 'test',
		chainId: 0,
		logo: pichiuLogo,
		rpcEndpoint: 'wss://kusama.kylin-node.co.uk',
		ss58Format: 42,
		tokenDecimals: 18,
		subsquidUrl: '',
		tokenSymbol: tokenSymbol.PCHU
	},
	[network.ROBONOMICS]: {
		blockTime: 12000,
		category: 'kusama',
		chainId: 2048,
		logo: robonomicsLogo,
		rpcEndpoint: 'wss://robonomics.api.onfinality.io/public-ws',
		ss58Format: 32,
		subsquidUrl: 'https://squid.subsquid.io/robonomics-polkassembly/graphql',
		tokenDecimals: 9,
		tokenSymbol: tokenSymbol.XRT
	},
	[network.SHIBUYA]: {
		blockTime: 12000,
		category: 'test',
		chainId: 81,
		logo: shidenLogo,
		rpcEndpoint: 'wss://shibuya-rpc.dwellir.com',
		ss58Format: 5,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.SBY
	},
	[network.SHIDEN]: {
		blockTime: 12000,
		category: 'kusama',
		chainId: 336,
		logo: shidenLogo,
		rpcEndpoint: 'wss://shiden.api.onfinality.io/public-ws',
		ss58Format: 5,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.SDN
	},
	[network.SNOW]:{
		blockTime: 12000,
		chainId: 0,
		logo: snowLogo,
		category: 'kusama',
		rpcEndpoint: 'wss://snow-rpc.icenetwork.io',
		ss58Format: 2207,
		tokenDecimals: 18,
		subsquidUrl: 'https://squid.subsquid.io/snow-polkassembly/graphql',
		tokenSymbol: tokenSymbol.ICZ
	},
	[network.TANGANIKA]: {
		blockTime: 12000,
		category: 'kusama',
		chainId: 336,
		logo: tanganikaLogo,
		rpcEndpoint: 'wss://tanganika.datahighway.com',
		ss58Format: 42,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.DHX
	},
	[network.TIDECHAIN]: {
		blockTime: 12000,
		category: 'test',
		chainId: 336,
		logo: tidechainLogo,
		rpcEndpoint: 'wss://rpc.tidefi.io:443',
		ss58Format: 7007,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.TDFY,
		subsquidUrl: ''
	},
	[network.TURING]: {
		blockTime: 12000,
		category: 'kusama',
		chainId: 2114,
		logo: turingLogo,
		rpcEndpoint: 'wss://turing-rpc.dwellir.com',
		ss58Format: 51,
		subsquidUrl: '',
		tokenDecimals: 10,
		tokenSymbol: tokenSymbol.TUR
	},
	[network.VARA]: {
		blockTime: 2000,
		category: 'test',
		chainId: 0,
		logo: varaLogo,
		rpcEndpoint: 'wss://archive-rpc.vara-network.io',
		ss58Format: 137,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.VARA,
		subsquidUrl: 'https://squid.subsquid.io/vara-polkassembly/graphql'
	},
	[network.WESTEND]: {
		blockTime: 6000,
		category: 'test',
		chainId: 0,
		logo: westendLogo,
		rpcEndpoint: 'wss://kusama-rpc.polkadot.io',
		ss58Format: 0,
		subsquidUrl: '',
		tokenDecimals: 10,
		tokenSymbol: tokenSymbol.WND
	},
	[network.XX]: {
		blockTime: 6000,
		category: 'solo',
		chainId: 0,
		logo: xxcoinLogo,
		rpcEndpoint: 'wss://rpc.xx.network',
		ss58Format: 55,
		tokenDecimals: 9,
		tokenSymbol: tokenSymbol.XX,
		subsquidUrl: 'https://squid.subsquid.io/xx-polkassembly/graphql'
	}
};

export const chainLinks: types.ChainLinksType = {
	[network.POLKADOT]: {
		blockExplorer: 'https://polkadot.subscan.io/',
		discord: 'https://discord.gg/wGUDt2p',
		github: 'https://github.com/paritytech/polkadot',
		homepage: 'https://polkadot.network/',
		reddit: 'https://www.reddit.com/r/polkadot',
		telegram: 'https://t.me/PolkadotOfficial',
		twitter: 'https://twitter.com/Polkadot',
		youtube: 'https://www.youtube.com/channel/UCB7PbjuZLEba_znc7mEGNgw'
	},
	[network.KUSAMA]: {
		blockExplorer: 'https://kusama.subscan.io/',
		discord: 'https://discord.gg/9AWjTf8wSk',
		github: 'https://github.com/paritytech/polkadot',
		homepage: 'https://kusama.network/',
		reddit: 'https://www.reddit.com/r/Kusama/',
		telegram: 'https://t.me/kusamanetworkofficial',
		twitter: 'https://twitter.com/kusamanetwork',
		youtube: 'https://www.youtube.com/channel/UCq4MRrQhdoIR0b44GxcCPxw'
	}
};

export const chainDetails: { [index: string]: string} = {
	[network.POLKADOT]: 'Polkadot enables scalability by allowing specialized blockchains to communicate with each other in a secure, trust-free environment. Polkadot is built to connect and secure unique blockchains, whether they be public, permission-less networks, private consortium chains, or oracles and other Web3 technologies. It enables an internet where independent blockchains can exchange information under common security guarantees. Polkadot uses a sophisticated governance mechanism that allows it to evolve gracefully overtime at the ultimate behest of its assembled stakeholders. The stated goal is to ensure that the majority of the stake can always command the network.',
	[network.KUSAMA]: 'Kusama is an early release of Polkadot: a scalable, multichain network for radical innovation. Kusama serves as a proving ground that allows teams and developers to build and deploy a parachain, and experiment with Polkadot’s governance and NPoS functionality in a real environment.'
};

export const addressPrefix: Record<string, number> = {
	'kusama': 2,
	'moonbeam': 1284,
	'moonriver': 1285,
	'moonbase': 1287,
	'polkadot': 0
};
