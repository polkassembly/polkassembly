// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import acalaLogo from '~assets/parachain-logos/acala-logo.jpg';
import acuityLogo from '~assets/parachain-logos/acuity-logo.jpg';
import integriteeLogo from '~assets/parachain-logos/integritee-logo.png';
import altairLogo from '~assets/parachain-logos/altair-logo.jpeg';
import amplitudeLogo from '~assets/parachain-logos/amplitude-logo.png';
import astarLogo from '~assets/parachain-logos/astar-logo.png';
import automataLogo from '~assets/parachain-logos/automata-logo.jpg';
import basiliskLogo from '~assets/parachain-logos/basilisk-logo.jpg';
import curioLogo from '~assets/parachain-logos/curio-logo.jpg';
import pioneerLogo from '~assets/parachain-logos/bitcountrypioneer-logo.jpg';
import calamariLogo from '~assets/parachain-logos/calamari-logo.png';
import centrifugeLogo from '~assets/parachain-logos/centrifuge-logo.png';
import cereLogo from '~assets/parachain-logos/cere-logo.jpg';
import collectivesLogo from '~assets/parachain-logos/collectives-logo.png';
import composableFinanceLogo from '~assets/parachain-logos/composable-finance-logo.png';
import crustLogo from '~assets/parachain-logos/crust-logo.png';
import equilibriumLogo from '~assets/parachain-logos/equilibrium-logo.png';
import frequencyLogo from '~assets/parachain-logos/frequency-logo.png';
import gearLogo from '~assets/parachain-logos/gear-logo.jpg';
import genshiroLogo from '~assets/parachain-logos/genshiro.png';
import gmordieLogo from '~assets/parachain-logos/gmordie-logo.png';
import hashedLogo from '~assets/parachain-logos/hashed-logo.png';
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
import zeitgeistLogo from '~assets/parachain-logos/zeitgeist-logo.png';
import polimecLogo from '~assets/parachain-logos/polimec-logo.png';
import phykenLogo from '~assets/parachain-logos/phyken-logo.png';
import mandalaLogo from '~assets/parachain-logos/mandala-logo.png';
import laossigmaLogo from '~assets/parachain-logos/laossigma-logo.png';

import * as types from '../types';
import { EAssets } from '~src/components/OpenGovTreasuryProposal/types';

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
	COLLECTIVES: 'collectives',
	COMPOSABLE: 'composable',
	CRUST: 'crust',
	CERE: 'cere',
	CRUSTSHADOW: 'crustshadow',
	EQUILIBRIUM: 'equilibrium',
	FREQUENCY: 'frequency',
	GEAR: 'gear',
	GENSHIRO: 'genshiro',
	GMORDIE: 'gmordie',
	HASHED: 'hashed',
	HEIKO: 'heiko',
	HYDRADX: 'hydradx',
	INTEGRITEE: 'integritee',
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
	POLIMEC: 'polimec',
	PHYKEN: 'phyken',
	ROLIMEC: 'rolimec',
	ROBONOMICS: 'robonomics',
	SNOW: 'snow',
	SHIBUYA: 'shibuya',
	SHIDEN: 'shiden',
	TANGANIKA: 'tanganika',
	TIDECHAIN: 'tidechain',
	PICASSO: 'picasso',
	PICHIU: 'pichiu',
	PICHIUROCOCO: 'pichiu-rococo',
	POLYMESH: 'polymesh',
	POLYMESHTEST: 'polymesh-test',
	ROCOCO: 'rococo',
	TURING: 'turing',
	VARA: 'vara',
	WESTEND: 'westend',
	WESTENDCOLLECTIVES: 'westend-collectives',
	XX: 'xx',
	ZEITGEIST: 'zeitgeist',
	MANDALA: 'mandala',
	CURIO: 'curio',
	LAOSSIGMA: 'laossigma'
};

export const tokenSymbol = {
	ACA: 'ACA',
	ACU: 'ACU',
	ASTR: 'ASTR',
	AMPE: 'AMPE',
	ATA: 'ATA',
	BNC: 'BNC',
	BSX: 'BSX',
	CERE: 'CERE',
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
	HASH: 'HASH',
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
	TEER: 'TEER',
	PICA: 'PICA',
	ROC: 'ROC',
	POLYX: 'POLYX',
	PLMC: 'PLMC',
	RLMC: 'RLMC',
	MQTY: 'MQTY',
	WND: 'WND',
	XRT: 'XRT',
	UNIT: 'UNIT',
	VARA: 'VARA',
	XX: 'XX',
	ZTG: 'ZTG',
	KPGT: 'KPGT',
	CGT: 'CGT',
	SIGMA: 'SIGMA'
};

export const treasuryAssets = {
	DED: { name: 'dot-is-ded', img: '/assets/icons/ded-asset.png', tokenDecimal: 10, symbol: EAssets.DED },
	USDT: {
		name: 'usdt',
		img: '/assets/icons/usdt.svg',
		tokenDecimal: 6,
		symbol: EAssets.USDT
	},
	USDC: {
		name: 'usdc',
		img: '/assets/icons/usdc.svg',
		tokenDecimal: 6,
		symbol: EAssets.USDC
	}
};

export const chainProperties: types.ChainPropType = {
	[network.POLKADOT]: {
		preImageBaseDeposit: '400000000000',
		assetHubRpcEndpoint: 'wss://dot-rpc.stakeworld.io/assethub',
		assetHubTreasuryAddress: '14xmwinmCEz6oRrFdczHKqHgWNMiCysE2KrA4jXXAAM1Eogk',
		blockTime: 6000,
		category: 'polkadot',
		chainId: 0,
		parachain: '1000',
		peopleChainParachain: '1004',
		peopleChainRpcEndpoint: 'wss://polkadot-people-rpc.polkadot.io',
		logo: polkadotLogo,
		palletInstance: '50',
		rpcEndpoint: 'wss://polkadot.api.onfinality.io/public-ws',
		ss58Format: 0,
		subsquidUrl: 'https://squid.subsquid.io/polkadot-polkassembly/graphql',
		tokenDecimals: 10,
		tokenSymbol: tokenSymbol.DOT,
		treasuryAddress: '5EYCAe5ijiYfyeZ2JJCGq56LmPyNRAKzpG4QkoQkkQNB5e6Z',
		treasuryProposalBondPercent: '5.00%',
		treasuryProposalMinBond: '100',
		treasuryProposalMaxBond: '500',
		externalLinks: 'https://polkadot.api.subscan.io',
		assethubExternalLinks: 'https://assethub-polkadot.api.subscan.io',
		gTag: 'G-JMMMFDX405',
		rpcEndpoints: [
			{
				label: 'via Parity (recommended)',
				key: 'wss://rpc.polkadot.io'
			},
			{
				label: 'via On-finality',
				key: 'wss://polkadot.api.onfinality.io/public-ws'
			},
			{
				label: 'via Dwellir',
				key: 'wss://polkadot-rpc.dwellir.com'
			},
			{
				label: 'via Pinknode',
				key: 'wss://public-rpc.pinknode.io/polkadot'
			},
			{
				label: 'via IBP-GeoDNS1',
				key: 'wss://rpc.ibp.network/polkadot'
			},
			{
				label: 'via IBP-GeoDNS2',
				key: 'wss://rpc.dotters.network/polkadot'
			},
			{
				label: 'via RadiumBlock',
				key: 'wss://polkadot.public.curie.radiumblock.co/ws'
			},
			{
				label: 'via LuckyFriday',
				key: 'wss://rpc-polkadot.luckyfriday.io'
			}
		],
		supportedAssets: [
			{ ...treasuryAssets.DED, genralIndex: '30' },
			{ ...treasuryAssets.USDT, genralIndex: '1984' },
			{ ...treasuryAssets.USDC, genralIndex: '1337' }
		],
		hydrationEndpoints: ['wss://hydradx-rpc.dwellir.com', 'wss://rpc.hydradx.cloud', 'wss://rpc.helikon.io/hydradx', 'wss://hydradx.paras.ibp.network'],
		hydrationTreasuryAddress: '7KCp4eenFS4CowF9SpQE5BBCj5MtoBA3K811tNyRmhLfH1aV',
		hydrationAssets: [
			{
				label: 'DOT',
				assetId: 5
			},
			{
				label: 'USDT',
				assetId: 10
			},
			{
				label: 'USDC',
				assetId: 22
			}
		]
	},
	[network.KUSAMA]: {
		preImageBaseDeposit: '1330000000000',
		blockTime: 6000,
		category: 'kusama',
		chainId: 0,
		parachain: '1000',
		peopleChainRpcEndpoint: 'wss://kusama-people-rpc.polkadot.io',
		peopleChainParachain: '1004',
		logo: kusamaLogo,
		palletInstance: '50',
		rpcEndpoint: 'wss://kusama-rpc.polkadot.io',
		ss58Format: 2,
		subsquidUrl: 'https://squid.subsquid.io/kusama-polkassembly/graphql',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.KSM,
		treasuryProposalBondPercent: '5.00%',
		treasuryProposalMinBond: '0.6666',
		treasuryProposalMaxBond: '33.3333',
		externalLinks: 'https://kusama.api.subscan.io',
		gTag: 'G-HCSSH2HY4H',
		rpcEndpoints: [
			{
				label: 'via On-finality',
				key: 'wss://kusama.api.onfinality.io/public-ws'
			},
			{
				label: 'via Dwellir',
				key: 'wss://kusama-rpc.dwellir.com'
			},
			{
				label: 'via Parity',
				key: 'wss://kusama-rpc.polkadot.io'
			},
			{
				label: 'via IBP-GeoDNS1',
				key: 'wss://rpc.ibp.network/kusama'
			},
			{
				label: 'via IBP-GeoDNS2',
				key: 'wss://rpc.dotters.network/kusama'
			},
			{
				label: 'via RadiumBlock',
				key: 'wss://kusama.public.curie.radiumblock.co/ws'
			},
			{
				label: 'via LuckyFriday',
				key: 'wss://rpc-kusama.luckyfriday.io'
			}
		],
		supportedAssets: [{ ...treasuryAssets.USDT, genralIndex: '1984' }]
	},
	[network.ACALA]: {
		blockTime: 12000,
		chainId: 0,
		logo: acalaLogo,
		category: 'polkadot',
		rpcEndpoint: 'wss://acala-polkadot.api.onfinality.io/public-ws',
		ss58Format: 10,
		tokenDecimals: 12,
		subsquidUrl: 'https://squid.subsquid.io/acala-polkassembly/graphql',
		tokenSymbol: tokenSymbol.ACA,
		treasuryProposalBondPercent: '5.00%',
		treasuryProposalMinBond: '10',
		treasuryProposalMaxBond: '50',
		externalLinks: 'https://acala.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Acala Foundation 0',
				key: 'wss://acala-rpc-0.aca-api.network'
			},
			{
				label: 'via Acala Foundation 1',
				key: 'wss://acala-rpc-1.aca-api.network'
			},
			{
				label: 'via Acala Foundation 3',
				key: 'wss://acala-rpc-3.aca-api.network/ws'
			},
			{
				label: 'via Dwellir',
				key: 'wss://acala-rpc.dwellir.com'
			},
			{
				label: 'via LuckyFriday',
				key: 'wss://rpc-acala.luckyfriday.io'
			},
			{
				label: 'via OnFinality',
				key: 'wss://acala-polkadot.api.onfinality.io/public-ws'
			}
		]
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
		tokenSymbol: tokenSymbol.ACU,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: '',
		gTag: null,
		rpcEndpoints: []
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
		tokenSymbol: tokenSymbol.BNC,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '100',
		treasuryProposalMaxBond: '500',
		externalLinks: 'https://altair.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Centrifuge',
				key: 'wss://fullnode.altair.centrifuge.io'
			},
			{
				label: 'via OnFinality',
				key: 'wss://altair.api.onfinality.io/public-ws'
			}
		]
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
		tokenSymbol: tokenSymbol.AMPE,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '10',
		treasuryProposalMaxBond: null,
		externalLinks: 'https://polkaholic.io',
		gTag: 'G-CJQ1ZL472N',
		rpcEndpoints: [
			{
				label: 'via Dwellir',
				key: 'wss://amplitude-rpc.dwellir.com'
			},
			{
				label: 'via PendulumChain',
				key: 'wss://rpc-amplitude.pendulumchain.tech'
			}
		]
	},
	[network.ASTAR]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 592,
		logo: astarLogo,
		rpcEndpoint: 'wss://astar-rpc.dwellir.com/',
		ss58Format: 5,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.ASTR,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: 'https://astar.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Astar',
				key: 'wss://rpc.astar.network'
			},
			{
				label: 'via Automata 1RPC',
				key: 'wss://1rpc.io/astr'
			},
			{
				label: 'via Blast',
				key: 'wss://astar.public.blastapi.io'
			},
			{
				label: 'via Dwellir',
				key: 'wss://astar-rpc.dwellir.com'
			},
			{
				label: 'via OnFinality',
				key: 'wss://astar.api.onfinality.io/public-ws'
			},
			{
				label: 'via RadiumBlock',
				key: 'wss://astar.public.curie.radiumblock.co/ws'
			}
		]
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
		tokenSymbol: tokenSymbol.ATA,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '100',
		treasuryProposalMaxBond: null,
		externalLinks: '',
		gTag: null,
		rpcEndpoints: []
	},
	[network.BASILISK]: {
		blockTime: 12000,
		category: 'kusama',
		chainId: 2090,
		logo: basiliskLogo,
		rpcEndpoint: 'wss://rpc.basilisk.cloud',
		ss58Format: 10041,
		subsquidUrl: 'https://squid.subsquid.io/basilisk-polkassembly/graphql',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.BSX,
		treasuryProposalBondPercent: '3%',
		treasuryProposalMinBond: '10000',
		treasuryProposalMaxBond: '50000',
		externalLinks: 'https://basilisk.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Basilisk',
				key: 'wss://rpc.basilisk.cloud'
			},
			{
				label: 'via Dwellir',
				key: 'wss://basilisk-rpc.dwellir.com'
			}
		]
	},
	[network.CURIO]: {
		blockTime: 12000,
		category: 'kusama',
		chainId: 3339,
		logo: curioLogo,
		rpcEndpoint: 'wss://archive.parachain.curioinvest.com/',
		ss58Format: 777,
		subsquidUrl: '',
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.CGT,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '1',
		treasuryProposalMaxBond: '5',
		externalLinks: '',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Curio',
				key: 'wss://archive.parachain.curioinvest.com/'
			}
		]
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
		tokenSymbol: tokenSymbol.BNC,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '1',
		treasuryProposalMaxBond: '50',
		externalLinks: 'https://pioneer.api.subscan.io',
		gTag: null,
		rpcEndpoints: []
	},
	[network.POLIMEC]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 0,
		logo: polimecLogo,
		rpcEndpoint: 'wss://polimec.rpc.amforc.com',
		ss58Format: 41,
		subsquidUrl: 'https://polkassembly.squids.live/polimec-polkassembly/graphql',
		tokenDecimals: 10,
		tokenSymbol: tokenSymbol.PLMC,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '1',
		treasuryProposalMaxBond: '50',
		externalLinks: 'https://explorer.polimec.org/polimec',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via IBP',
				key: 'wss://polimec.rpc.amforc.com'
			},
			{
				label: 'via Helikon',
				key: 'wss://rpc.helikon.io/polimec'
			},
			{
				label: 'via Polimec Foundation',
				key: 'wss://rpc.polimec.org'
			},
			{
				label: 'via Amforc',
				key: ' wss://polimec.rpc.amforc.com'
			}
		]
	},
	[network.ROLIMEC]: {
		blockTime: 12000,
		category: 'test',
		chainId: 0,
		logo: polimecLogo,
		rpcEndpoint: 'wss://rpc.rolimec.org/',
		ss58Format: 41,
		subsquidUrl: 'https://squid.subsquid.io/rolimec-polkassembly/graphql',
		tokenDecimals: 10,
		tokenSymbol: tokenSymbol.RLMC,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '1',
		treasuryProposalMaxBond: '50',
		externalLinks: '',
		gTag: null,
		rpcEndpoints: []
	},
	[network.PHYKEN]: {
		blockTime: 12000,
		category: 'solo',
		chainId: 0,
		logo: phykenLogo,
		rpcEndpoint: 'wss://rpc.polimec.org',
		// TODO: Update rpcEndpoint
		ss58Format: 666,
		subsquidUrl: '',
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.MQTY,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '1',
		treasuryProposalMaxBond: '50',
		externalLinks: 'https://phyken.api.subscan.io',
		gTag: null,
		rpcEndpoints: []
	},
	[network.MANDALA]: {
		blockTime: 6000,
		category: 'solo',
		chainId: 0,
		logo: mandalaLogo,
		rpcEndpoint: 'wss://node1.mandalachain.io/',
		ss58Format: 42,
		subsquidUrl: '',
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.KPGT,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '1',
		treasuryProposalMaxBond: '50',
		externalLinks: 'https://testnet.mandalascan.io/',
		gTag: null,
		rpcEndpoints: []
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
		tokenSymbol: tokenSymbol.KMA,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: 'https://calamari.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Manta Network',
				key: 'wss://calamari.systems'
			}
		]
	},
	[network.CENTRIFUGE]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 0,
		logo: centrifugeLogo,
		rpcEndpoint: 'wss://centrifuge-parachain.api.onfinality.io/public-ws',
		ss58Format: 36,
		subsquidUrl: 'https://squid.subsquid.io/centrifuge-polkassembly/graphql',
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.CFG,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '1000',
		treasuryProposalMaxBond: '5000',
		externalLinks: 'https://centrifuge.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Centrifuge',
				key: 'wss://fullnode.centrifuge.io'
			},
			{
				label: 'via Dwellir',
				key: 'wss://centrifuge-rpc.dwellir.com'
			},
			{
				label: 'via LuckyFriday',
				key: 'wss://rpc-centrifuge.luckyfriday.io'
			},
			{
				label: 'via OnFinality',
				key: 'wss://centrifuge-parachain.api.onfinality.io/public-ws'
			}
		]
	},
	[network.CERE]: {
		blockTime: 6000,
		category: 'solo',
		chainId: 0,
		logo: cereLogo,
		rpcEndpoint: 'wss://archive.mainnet.cere.network/ws',
		ss58Format: 54,
		subsquidUrl: 'https://polkassembly.squids.live/cere-polkassembly/graphql',
		tokenDecimals: 10,
		tokenSymbol: tokenSymbol.CERE,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '100',
		treasuryProposalMaxBond: null,
		externalLinks: 'https://stats.cere.network',
		gTag: 'G-7E14M1ZSCB',
		rpcEndpoints: [
			{
				label: 'via Cere Network',
				key: 'wss://archive.mainnet.cere.network/ws'
			}
		]
	},
	//TODO: Aleem=> Need to update collective network, currently using polkadot data
	[network.COLLECTIVES]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 0,
		logo: collectivesLogo,
		rpcEndpoint: 'wss://rpc-collectives-polkadot.luckyfriday.io',
		relayRpcEndpoints: [
			{ key: 'wss://1rpc.io/dot', label: 'Automata 1RPC' },
			{ key: 'wss://polkadot-public-rpc.blockops.network/ws', label: 'BlockOps' },
			{ key: 'wss://polkadot-rpc.dwellir.com', label: 'Dwellir' },
			{ key: 'wss://polkadot-rpc-tn.dwellir.com', label: 'Dwellir Tunisia' },
			{ key: 'wss://rpc.ibp.network/polkadot', label: 'IBP-GeoDNS1' },
			{ key: 'wss://rpc.dotters.network/polkadot', label: 'IBP-GeoDNS2' },
			{ key: 'wss://rpc-polkadot.luckyfriday.io', label: 'LuckyFriday' },
			{ key: 'wss://polkadot.api.onfinality.io/public-ws', label: 'OnFinality' },
			{ key: 'wss://rpc.polkadot.io', label: 'Parity' },
			{ key: 'wss://polkadot.public.curie.radiumblock.co/ws', label: 'RadiumBlock' },
			{ key: 'wss://dot-rpc.stakeworld.io', label: 'Stakeworld' }
		],
		ss58Format: 0,
		subsquidUrl: 'https://polkassembly.squids.live/collectives-polkassembly/graphql',
		tokenDecimals: 10,
		tokenSymbol: tokenSymbol.DOT,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: '',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Dwellir',
				key: 'wss://polkadot-collectives-rpc.dwellir.com'
			},
			{
				label: 'via Dwellir Tunisia',
				key: 'wss://polkadot-collectives-rpc-tn.dwellir.com'
			},
			{
				label: 'via IBP-GeoDNS1',
				key: 'wss://sys.ibp.network/collectives-polkadot'
			},
			{
				label: 'via IBP-GeoDNS2',
				key: 'wss://sys.dotters.network/collectives-polkadot'
			},
			{
				label: 'via LuckyFriday',
				key: 'wss://rpc-collectives-polkadot.luckyfriday.io'
			},
			{
				label: 'via OnFinality',
				key: 'wss://collectives.api.onfinality.io/public-ws'
			},
			{
				label: 'via Parity',
				key: 'wss://polkadot-collectives-rpc.polkadot.io'
			},
			{
				label: 'via IBP-GeoDNS2',
				key: 'wss://collectives.public.curie.radiumblock.co/ws'
			},
			{
				label: 'via Stakeworld',
				key: 'wss://dot-rpc.stakeworld.io/collectives'
			}
		]
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
		tokenSymbol: tokenSymbol.LAYR,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '5',
		treasuryProposalMaxBond: '1000',
		externalLinks: 'https://composable.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Composable',
				key: 'wss://rpc.composable.finance'
			},
			{
				label: 'via Dwellir',
				key: 'wss://composable-rpc.dwellir.com'
			}
		]
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
		tokenSymbol: tokenSymbol.CRU,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: 'https://crust.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Crust',
				key: 'wss://crust-parachain.crustapps.net'
			}
		]
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
		tokenSymbol: tokenSymbol.CSM,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: '',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Crust',
				key: 'wss://rpc-shadow.crust.network/'
			}
		]
	},
	[network.EQUILIBRIUM]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 0,
		logo: equilibriumLogo,
		rpcEndpoint: 'wss://equilibrium-rpc.dwellir.com',
		ss58Format: 68,
		tokenDecimals: 9,
		tokenSymbol: tokenSymbol.TOKEN,
		subsquidUrl: 'https://squid.subsquid.io/equilibrium-polkassembly/graphql',
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: 'https://equilibrium.api.subscan.io',
		gTag: 'G-PPZV91T0GH',
		rpcEndpoints: [
			{
				label: 'via Dwellir',
				key: 'wss://equilibrium-rpc.dwellir.com'
			}
		]
	},
	[network.FREQUENCY]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 0,
		logo: frequencyLogo,
		rpcEndpoint: 'wss://0.rpc.frequency.xyz',
		ss58Format: 90,
		tokenDecimals: 8,
		tokenSymbol: tokenSymbol.FRQCY,
		subsquidUrl: 'https://squid.subsquid.io/frequency-polkassembly/graphql',
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: '',
		gTag: 'G-26N0DJ37DD',
		rpcEndpoints: [
			{
				label: 'via Dwellir',
				key: 'wss://frequency-rpc.dwellir.com'
			},
			{
				label: 'via Frequency 0',
				key: 'wss://0.rpc.frequency.xyz'
			},
			{
				label: 'via Frequency 1',
				key: 'wss://1.rpc.frequency.xyz'
			}
		]
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
		tokenSymbol: tokenSymbol.UNIT,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: '',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Vara',
				key: 'wss://rpc.vara.network'
			}
		]
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
		subsquidUrl: '',
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: 'https://genshiro.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Genshiro',
				key: 'wss://node.ksm.genshiro.io'
			}
		]
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
		subsquidUrl: '',
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: '',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via GMorDieDAO',
				key: 'wss://kusama.gmordie.com'
			},
			{
				label: 'via GM Intern',
				key: 'wss://intern.gmordie.com'
			},
			{
				label: 'via TerraBioDAO',
				key: 'wss://ws-node-gm.terrabiodao.org'
			},
			{
				label: 'via Leemo',
				key: 'wss://leemo.gmordie.com'
			},
			{
				label: 'via bLd Nodes',
				key: 'wss://ws.gm.bldnodes.org'
			}
		]
	},
	[network.HASHED]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 0,
		logo: hashedLogo,
		rpcEndpoint: 'wss://c1.hashed.live',
		ss58Format: 42,
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.HASH,
		subsquidUrl: 'https://squid.subsquid.io/hashed-polkassembly/graphql',
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '0.000000066666666',
		treasuryProposalMaxBond: '0.0000033333333',
		externalLinks: '',
		gTag: 'G-KQYQ8N8337',
		rpcEndpoints: [
			{
				label: 'via Hashed Systems 1',
				key: 'wss://c1.hashed.live'
			},
			{
				label: 'via Hashed Systems 2',
				key: 'wss://c2.hashed.network'
			},
			{
				label: 'via Hashed Systems 3',
				key: 'wss://c3.hashed.network'
			}
		]
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
		tokenSymbol: tokenSymbol.HKO,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: '',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via OnFinality',
				key: 'wss://parallel-heiko.api.onfinality.io/public-ws'
			},
			{
				label: 'via Parallel',
				key: 'wss://heiko-rpc.parallel.fi'
			}
		]
	},
	[network.HYDRADX]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 0,
		logo: hydradxLogo,
		rpcEndpoint: 'wss://rpc.hydradx.cloud',
		ss58Format: 63,
		subsquidUrl: 'https://squid.subsquid.io/hydradx-polkassembly/graphql',
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.HDX,
		treasuryProposalBondPercent: '3%',
		treasuryProposalMinBond: '10000',
		treasuryProposalMaxBond: '50000',
		externalLinks: 'https://hydradx.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Dwellir',
				key: 'wss://hydradx-rpc.dwellir.com'
			},
			{
				label: 'via Galactic Council',
				key: 'wss://rpc.hydradx.cloud'
			}
		]
	},
	[network.INTEGRITEE]: {
		blockTime: 12000,
		category: 'kusama',
		chainId: 0,
		logo: integriteeLogo,
		rpcEndpoint: 'wss://integritee-kusama.api.onfinality.io/public-ws',
		ss58Format: 13,
		subsquidUrl: 'https://squid.subsquid.io/integritee-polkassembly/graphql',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.TEER,
		treasuryProposalBondPercent: '3%',
		treasuryProposalMinBond: '10000',
		treasuryProposalMaxBond: '50000',
		externalLinks: 'https://integritee.api.subscan.io',
		gTag: 'G-D4LGZ5LEGK',
		rpcEndpoints: [
			{
				label: 'via Integritee',
				key: 'wss://kusama.api.integritee.network'
			},
			{
				label: 'via OnFinality',
				key: 'wss://integritee-kusama.api.onfinality.io/public-ws'
			}
		]
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
		tokenSymbol: tokenSymbol.KAR,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '5',
		treasuryProposalMaxBond: '25',
		externalLinks: 'https://karura.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Acala Foundation 0',
				key: 'wss://karura-rpc-0.aca-api.network/ws'
			},
			{
				label: 'via Acala Foundation 1',
				key: 'wss://karura-rpc-1.aca-api.network/ws'
			},
			{
				label: 'via Acala Foundation 2',
				key: 'wss://karura-rpc-2.aca-api.network/ws'
			},
			{
				label: 'via Acala Foundation 3',
				key: 'wss://karura-rpc-3.aca-api.network/ws'
			},
			{
				label: 'via LuckyFriday',
				key: 'wss://rpc-karura.luckyfriday.io'
			},
			{
				label: 'via OnFinality',
				key: 'wss://karura.api.onfinality.io/public-ws'
			}
		]
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
		tokenSymbol: tokenSymbol.KYL,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: '',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Kylin Network',
				key: 'wss://kusama.kylin-node.co.uk'
			}
		]
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
		tokenSymbol: tokenSymbol.KHA,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '1',
		treasuryProposalMaxBond: null,
		externalLinks: 'https://khala.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Dwellir',
				key: 'wss://khala-rpc.dwellir.com'
			},
			{
				label: 'via OnFinality',
				key: 'wss://khala.api.onfinality.io/public-ws'
			},
			{
				label: 'via Phala',
				key: 'wss://khala-api.phala.network/ws'
			}
		]
	},
	[network.KILT]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 0,
		logo: kiltLogo,
		rpcEndpoint: 'wss://kilt-rpc.dwellir.com',
		ss58Format: 38,
		subsquidUrl: 'https://squid.subsquid.io/kilt-polkassembly/graphql',
		tokenDecimals: 15,
		tokenSymbol: tokenSymbol.KILT,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '20',
		treasuryProposalMaxBond: null,
		externalLinks: 'https://spiritnet.api.subscan.io',
		gTag: 'G-J37GVF0HCS',
		rpcEndpoints: [
			{
				label: 'via BOTLabs',
				key: 'wss://spiritnet.kilt.io/'
			},
			{
				label: 'via Dwellir',
				key: 'wss://kilt-rpc.dwellir.com'
			},
			{
				label: 'via OnFinality',
				key: 'wss://spiritnet.api.onfinality.io/public-ws'
			}
		]
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
		tokenSymbol: tokenSymbol.DOL,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: '',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Manta Networks',
				key: 'wss://calamari.systems'
			}
		]
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
		tokenSymbol: tokenSymbol.DEV,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '1',
		treasuryProposalMaxBond: null,
		externalLinks: 'https://moonbase.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Blast',
				key: 'wss://moonbase-alpha.public.blastapi.io'
			},
			{
				label: 'via Dwellir',
				key: 'wss://moonbase-rpc.dwellir.com'
			},
			{
				label: 'via Moonbeam Foundation',
				key: 'wss://wss.api.moonbase.moonbeam.network'
			},
			{
				label: 'via OnFinality',
				key: 'wss://moonbeam-alpha.api.onfinality.io/public-ws'
			},
			{
				label: 'via UnitedBloc',
				key: 'wss://moonbase.unitedbloc.com'
			}
		]
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
		tokenSymbol: tokenSymbol.SBY,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: 'https://shibuya.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Astar',
				key: 'wss://rpc.shibuya.astar.network'
			},
			{
				label: 'via Dwellir',
				key: 'wss://shibuya-rpc.dwellir.com'
			}
		]
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
		tokenSymbol: tokenSymbol.GLMR,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '100',
		treasuryProposalMaxBond: null,
		externalLinks: 'https://moonbeam.api.subscan.io',
		gTag: 'G-FS09G34H85',
		rpcEndpoints: [
			{
				label: 'via Automata 1RPC',
				key: 'wss://1rpc.io/glmr'
			},
			{
				label: 'via Blast',
				key: 'wss://moonbeam.public.blastapi.io'
			},
			{
				label: 'via Dwellir',
				key: 'wss://moonbeam-rpc.dwellir.com'
			},
			{
				label: 'via Moonbeam Foundation',
				key: 'wss://wss.api.moonbeam.network'
			},
			{
				label: 'via OnFinality',
				key: 'wss://moonbeam.api.onfinality.io/public-ws'
			},
			{
				label: 'via UnitedBloc',
				key: 'wss://moonbeam.unitedbloc.com'
			}
		]
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
		tokenSymbol: tokenSymbol.MOVR,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '1',
		treasuryProposalMaxBond: null,
		externalLinks: 'https://moonriver.api.subscan.io',
		gTag: 'G-RMV9VEZFF2',
		rpcEndpoints: [
			{
				label: 'via Blast',
				key: 'wss://moonriver.public.blastapi.io'
			},
			{
				label: 'via Dwellir',
				key: 'wss://moonriver-rpc.dwellir.com'
			},
			{
				label: 'via Moonbeam Foundation',
				key: 'wss://wss.api.moonriver.moonbeam.network'
			},
			{
				label: 'via OnFinality',
				key: 'wss://moonriver.api.onfinality.io/public-ws'
			},
			{
				label: 'via UnitedBloc',
				key: 'wss://moonriver.unitedbloc.com'
			}
		]
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
		tokenSymbol: tokenSymbol.MYRIA,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '1',
		treasuryProposalMaxBond: null,
		externalLinks: 'https://explorer.mainnet.oct.network/myriad',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Myriad',
				key: 'wss://ws-rpc.myriad.social'
			},
			{
				label: 'via Octopus',
				key: 'wss://gateway.mainnet.octopus.network/myriad/a4cb0a6e30ff5233a3567eb4e8cb71e0'
			}
		]
	},
	[network.PARALLEL]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 172,
		logo: parallelLogo,
		rpcEndpoint: 'wss://rpc.parallel.fi',
		ss58Format: 172,
		subsquidUrl: 'https://squid.subsquid.io/parallel-polkassembly/graphql',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.PARA,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '1',
		treasuryProposalMaxBond: '5',
		externalLinks: 'https://parallel.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Dwellir',
				key: 'wss://parallel-rpc.dwellir.com'
			},
			{
				label: 'via Parallel',
				key: 'wss://rpc.parallel.fi'
			}
		]
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
		tokenSymbol: tokenSymbol.PEN,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: 'https://pendulum.api.subscan.io',
		gTag: 'G-EGV0NKCPZG',
		rpcEndpoints: [
			{
				label: 'via Dwellir',
				key: 'wss://pendulum-rpc.dwellir.com'
			},
			{
				label: 'via PendulumChain',
				key: 'wss://rpc-pendulum.prd.pendulumchain.tech'
			}
		]
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
		tokenSymbol: tokenSymbol.PDEX,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '100',
		treasuryProposalMaxBond: '100',
		externalLinks: 'https://polkadex.api.subscan.io',
		gTag: 'G-EB50MSH198',
		rpcEndpoints: [
			{
				label: 'via OnFinality',
				key: 'wss://polkadex.api.onfinality.io/public-ws'
			},
			{
				label: 'via RadiumBlock',
				key: 'wss://polkadex.public.curie.radiumblock.co/ws'
			}
		]
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
		subsquidUrl: 'https://polkassembly.squids.live/polymesh-polkassembly/graphql',
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: 'https://polymesh.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Polymesh',
				key: 'wss://mainnet-rpc.polymesh.network'
			}
		]
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
		subsquidUrl: '',
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: '',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Polymesh',
				key: 'wss://testnet-rpc.polymesh.live'
			}
		]
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
		tokenSymbol: tokenSymbol.PICA,
		treasuryProposalBondPercent: '5.00%',
		treasuryProposalMinBond: '5000',
		treasuryProposalMaxBond: '10000',
		externalLinks: 'https://picasso.api.subscan.io',
		gTag: 'G-2MRWG10DTE',
		rpcEndpoints: [
			{
				label: 'via Composable',
				key: 'wss://rpc.composablenodes.tech'
			},
			{
				label: 'via Dwellir',
				key: 'wss://picasso-rpc.dwellir.com'
			}
		]
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
		tokenSymbol: tokenSymbol.PCHU,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: '',
		gTag: null,
		rpcEndpoints: []
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
		tokenSymbol: tokenSymbol.PCHU,
		treasuryProposalBondPercent: '5.00%',
		treasuryProposalMinBond: '5',
		treasuryProposalMaxBond: '25',
		externalLinks: '',
		gTag: null,
		rpcEndpoints: []
	},
	[network.ROBONOMICS]: {
		blockTime: 12000,
		category: 'kusama',
		chainId: 2048,
		logo: robonomicsLogo,
		rpcEndpoint: 'wss://kusama.rpc.robonomics.network/',
		ss58Format: 32,
		subsquidUrl: 'https://polkassembly.squids.live/robonomics-polkassembly/graphql',
		tokenDecimals: 9,
		tokenSymbol: tokenSymbol.XRT,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '10',
		treasuryProposalMaxBond: null,
		externalLinks: 'https://robonomics.api.subscan.io',
		gTag: 'G-P13GPB87GC',
		rpcEndpoints: [
			{
				label: 'via Airalab',
				key: 'wss://kusama.rpc.robonomics.network/'
			},
			{
				label: 'via Samsara',
				key: 'wss://robonomics.0xsamsara.com'
			}
		]
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
		tokenSymbol: tokenSymbol.SBY,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '100',
		treasuryProposalMaxBond: null,
		externalLinks: 'https://shibuya.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Astar',
				key: 'wss://rpc.shibuya.astar.network'
			},
			{
				label: 'via Dwellir',
				key: 'wss://shibuya-rpc.dwellir.com'
			}
		]
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
		tokenSymbol: tokenSymbol.SDN,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: 'https://shiden.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Astar',
				key: 'wss://rpc.shiden.astar.network'
			},
			{
				label: 'via Blast',
				key: 'wss://shiden.public.blastapi.io'
			},
			{
				label: 'via Dwellir',
				key: 'wss://shiden-rpc.dwellir.com'
			},
			{
				label: 'via OnFinality',
				key: 'wss://shiden.api.onfinality.io/public-ws'
			}
		]
	},
	[network.SNOW]: {
		blockTime: 12000,
		chainId: 0,
		logo: snowLogo,
		category: 'kusama',
		rpcEndpoint: 'wss://snow-rpc.icenetwork.io',
		ss58Format: 2207,
		tokenDecimals: 18,
		subsquidUrl: 'https://squid.subsquid.io/snow-polkassembly/graphql',
		tokenSymbol: tokenSymbol.ICZ,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: 'https://snow.api.subscan.io',
		gTag: null,
		rpcEndpoints: []
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
		tokenSymbol: tokenSymbol.DHX,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '1',
		treasuryProposalMaxBond: null,
		externalLinks: '',
		gTag: null,
		rpcEndpoints: []
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
		subsquidUrl: '',
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: '',
		gTag: null,
		rpcEndpoints: []
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
		tokenSymbol: tokenSymbol.TUR,
		treasuryProposalBondPercent: '5%',
		treasuryProposalMinBond: '1',
		treasuryProposalMaxBond: '5',
		externalLinks: 'https://turing.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Dwellir',
				key: 'wss://turing-rpc.dwellir.com'
			},
			{
				label: 'via OAK',
				key: 'wss://rpc.turing.oak.tech'
			}
		]
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
		subsquidUrl: 'https://squid.subsquid.io/vara-polkassembly/graphql',
		treasuryProposalBondPercent: '5.00%',
		treasuryProposalMinBond: '20',
		treasuryProposalMaxBond: null,
		externalLinks: '',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Gear',
				key: 'wss://rpc.vara.network'
			}
		]
	},
	[network.WESTENDCOLLECTIVES]: {
		blockTime: 6000,
		category: 'test',
		chainId: 0,
		logo: westendLogo,
		rpcEndpoint: 'wss://sys.ibp.network/collectives-westend',
		ss58Format: 0,
		subsquidUrl: 'https://squid.subsquid.io/westend-collectives/graphql',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.WND,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: '',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Dwellir',
				key: 'wss://westend-collectives-rpc.dwellir.com'
			},
			{
				label: 'via Dwellir Tunisia',
				key: 'wss://westend-collectives-rpc-tn.dwellir.com'
			},
			{
				label: 'via IBP-GeoDNS1',
				key: 'wss://sys.ibp.network/collectives-westend'
			},
			{
				label: 'via IBP-GeoDNS2',
				key: 'wss://sys.dotters.network/collectives-westend'
			},
			{
				label: 'via Parity',
				key: 'wss://westend-collectives-rpc.polkadot.io'
			}
		]
	},
	[network.WESTEND]: {
		blockTime: 6000,
		category: 'test',
		chainId: 0,
		logo: westendLogo,
		rpcEndpoint: 'wss://westend-rpc.dwellir.com',
		ss58Format: 0,
		subsquidUrl: 'https://polkassembly.squids.live/westend-polkassembly/graphql',
		tokenDecimals: 10,
		tokenSymbol: tokenSymbol.WND,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: 'https://westend.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Dwellir',
				key: 'wss://westend-rpc.dwellir.com'
			},
			{
				label: 'via Dwellir Tunisia',
				key: 'wss://westend-rpc-tn.dwellir.com'
			},
			{
				label: 'via IBP-GeoDNS1',
				key: 'wss://rpc.ibp.network/westend'
			},
			{
				label: 'via IBP-GeoDNS2',
				key: 'wss://rpc.dotters.network/westend'
			},
			{
				label: 'via LuckyFriday',
				key: 'wss://rpc-westend.luckyfriday.io'
			},
			{
				label: 'via OnFinality',
				key: 'wss://westend.api.onfinality.io/public-ws'
			},
			{
				label: 'via Parity',
				key: 'wss://westend-rpc.polkadot.io'
			},
			{
				label: 'via RadiumBlock',
				key: 'wss://westend.public.curie.radiumblock.co/ws'
			},
			{
				label: 'via Stakeworld',
				key: 'wss://wnd-rpc.stakeworld.io'
			}
		]
	},
	[network.ROCOCO]: {
		preImageBaseDeposit: '130000000000',
		blockTime: 6000,
		category: 'test',
		chainId: 0,
		logo: westendLogo,
		rpcEndpoint: 'wss://rococo-rpc.polkadot.io',
		ss58Format: 42,
		subsquidUrl: 'https://squid.subsquid.io/rococo-polkassembly/graphql',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.ROC,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: 'https://rococo.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Parity',
				key: 'wss://rococo-rpc.polkadot.io'
			}
		],
		supportedAssets: [
			{ ...treasuryAssets.DED, genralIndex: '30' },
			{ ...treasuryAssets.USDT, genralIndex: '1984' },
			{ ...treasuryAssets.USDC, genralIndex: '1337' }
		]
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
		subsquidUrl: 'https://squid.subsquid.io/xx-polkassembly/graphql',
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: 'https://explorer.xx.network',
		gTag: 'G-23WF4VNWK4',
		rpcEndpoints: []
	},
	[network.ZEITGEIST]: {
		blockTime: 12000,
		category: 'polkadot',
		chainId: 0,
		logo: zeitgeistLogo,
		rpcEndpoint: 'wss://zeitgeist.api.onfinality.io/public-ws',
		ss58Format: 73,
		subsquidUrl: 'https://squid.subsquid.io/zeitgeist-polkassembly/graphql',
		tokenDecimals: 10,
		tokenSymbol: tokenSymbol.ZTG,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: 'https://zeitgeist.api.subscan.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Dwellir',
				key: 'wss://zeitgeist-rpc.dwellir.com'
			},
			{
				label: 'via OnFinality',
				key: 'wss://zeitgeist.api.onfinality.io/public-ws'
			},
			{
				label: 'via ZeitgeistPM',
				key: 'wss://main.rpc.zeitgeist.pm/ws'
			}
		]
	},
	[network.LAOSSIGMA]: {
		blockTime: 13000,
		category: 'test',
		chainId: 0,
		logo: laossigmaLogo,
		rpcEndpoint: 'wss://rpc.laossigma.laosfoundation.io',
		ss58Format: 42,
		subsquidUrl: 'https://polkassembly.squids.live/laos-polkassembly/graphql',
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.SIGMA,
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: 'https://sigma.explorer.laosnetwork.io',
		gTag: null,
		rpcEndpoints: [
			{
				label: 'via Dwellir',
				key: 'wss://rpc.laossigma.laosfoundation.io'
			}
		]
	}
};

export const chainLinks: types.ChainLinksType = {
	[network.POLKADOT]: {
		blockExplorer: 'https://polkadot.api.subscan.io/',
		discord: 'https://discord.gg/polkadot',
		github: 'https://github.com/paritytech/polkadot',
		homepage: 'https://polkadot.network/',
		reddit: 'https://www.reddit.com/r/polkadot',
		telegram: 'https://t.me/PolkadotOfficial',
		twitter: 'https://twitter.com/Polkadot',
		youtube: 'https://www.youtube.com/channel/UCB7PbjuZLEba_znc7mEGNgw'
	},
	[network.KUSAMA]: {
		blockExplorer: 'https://kusama.api.subscan.io/',
		discord: 'https://discord.gg/9AWjTf8wSk',
		github: 'https://github.com/paritytech/polkadot',
		homepage: 'https://kusama.network/',
		reddit: 'https://www.reddit.com/r/Kusama/',
		telegram: 'https://t.me/kusamanetworkofficial',
		twitter: 'https://twitter.com/kusamanetwork',
		youtube: 'https://www.youtube.com/channel/UCq4MRrQhdoIR0b44GxcCPxw'
	}
};

export const chainDetails: { [index: string]: string } = {
	[network.POLKADOT]:
		'Polkadot enables scalability by allowing specialized blockchains to communicate with each other in a secure, trust-free environment. Polkadot is built to connect and secure unique blockchains, whether they be public, permission-less networks, private consortium chains, or oracles and other Web3 technologies. It enables an internet where independent blockchains can exchange information under common security guarantees. Polkadot uses a sophisticated governance mechanism that allows it to evolve gracefully overtime at the ultimate behest of its assembled stakeholders. The stated goal is to ensure that the majority of the stake can always command the network.',
	[network.KUSAMA]:
		'Kusama is an early release of Polkadot: a scalable, multichain network for radical innovation. Kusama serves as a proving ground that allows teams and developers to build and deploy a parachain, and experiment with Polkadot’s governance and NPoS functionality in a real environment.'
};

export const addressPrefix: Record<string, number> = {
	kusama: 2,
	moonbeam: 1284,
	moonriver: 1285,
	moonbase: 1287,
	polkadot: 0,
	curio: 777
};
