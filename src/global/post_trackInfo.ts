// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-tabs */
/* eslint-disable sort-keys */
import { PostOrigin, TrackInfoType } from 'src/types';

interface INetworkTrackInfo {
	[index: string] : TrackInfoType
}

export const networkTrackInfo: INetworkTrackInfo = {
	kusama: {
		[PostOrigin.ROOT] : {
			'trackId': 0,
			'description': 'Origin for General network-wide improvements',
			'group': 'Main',
			'name': 'root',
			'maxDeciding': 1,
			'decisionDeposit': 3333333333300000,
			'preparePeriod': 1200,
			'decisionPeriod': 201600,
			'confirmPeriod': 14400,
			'minEnactmentPeriod': 14400,
			'minApproval': {
				'reciprocal': {
					'factor': 222222224,
					'xOffset': 333333335,
					'yOffset': 333333332
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.WHITELISTED_CALLER] : {
			'trackId': 1,
			'description': 'Origin able to dispatch a whitelisted call.',
			'group': 'Whitelist',
			'name': 'whitelisted_caller',
			'maxDeciding': 100,
			'decisionDeposit': 333333333330000,
			'preparePeriod': 300,
			'decisionPeriod': 201600,
			'confirmPeriod': 100,
			'minEnactmentPeriod': 100,
			'minApproval': {
				'reciprocal': {
					'factor': 270899180,
					'xOffset': 389830523,
					'yOffset': 305084738
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 8650766,
					'xOffset': 18867926,
					'yOffset': 41509433
				}
			}
		},
		[PostOrigin.STAKING_ADMIN] : {
			'trackId': 10,
			'description': 'Origin for cancelling slashes.',
			'group': 'Main',
			'name': 'staking_admin',
			'maxDeciding': 10,
			'decisionDeposit': 166666666665000,
			'preparePeriod': 1200,
			'decisionPeriod': 201600,
			'confirmPeriod': 1800,
			'minEnactmentPeriod': 100,
			'minApproval': {
				'linearDecreasing': {
					'length': 607142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 7892829,
					'xOffset': 15544040,
					'yOffset': -7772020
				}
			}
		},
		[PostOrigin.TREASURER] : {
			'trackId': 11,
			'description': 'Origin for spending (any amount of) funds.',
			'group': 'Treasury',
			'name': 'treasurer',
			'maxDeciding': 10,
			'decisionDeposit': 33333333333000,
			'preparePeriod': 1200,
			'decisionPeriod': 201600,
			'confirmPeriod': 1800,
			'minEnactmentPeriod': 14400,
			'minApproval': {
				'reciprocal': {
					'factor': 222222224,
					'xOffset': 333333335,
					'yOffset': 333333332
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.LEASE_ADMIN] : {
			'trackId': 12,
			'description': 'Origin able to force slot leases.',
			'group': 'Governance',
			'name': 'lease_admin',
			'maxDeciding': 10,
			'decisionDeposit': 166666666665000,
			'preparePeriod': 1200,
			'decisionPeriod': 201600,
			'confirmPeriod': 1800,
			'minEnactmentPeriod': 100,
			'minApproval': {
				'linearDecreasing': {
					'length': 607142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 7892829,
					'xOffset': 15544040,
					'yOffset': -7772020
				}
			}
		},
		[PostOrigin.FELLOWSHIP_ADMIN] : {
			'trackId': 13,
			'description': 'Origin for managing the composition of the fellowship.',
			'group': 'Whitelist',
			'name': 'fellowship_admin',
			'maxDeciding': 10,
			'decisionDeposit': 166666666665000,
			'preparePeriod': 1200,
			'decisionPeriod': 201600,
			'confirmPeriod': 1800,
			'minEnactmentPeriod': 100,
			'minApproval': {
				'linearDecreasing': {
					'length': 607142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 7892829,
					'xOffset': 15544040,
					'yOffset': -7772020
				}
			}
		},
		[PostOrigin.GENERAL_ADMIN] : {
			'trackId': 14,
			'description': 'Origin for managing the registrar.',
			'group': 'Governance',
			'name': 'general_admin',
			'maxDeciding': 10,
			'decisionDeposit': 166666666665000,
			'preparePeriod': 1200,
			'decisionPeriod': 201600,
			'confirmPeriod': 1800,
			'minEnactmentPeriod': 100,
			'minApproval': {
				'reciprocal': {
					'factor': 222222224,
					'xOffset': 333333335,
					'yOffset': 333333332
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 49586777,
					'xOffset': 90909091,
					'yOffset': -45454546
				}
			}
		},
		[PostOrigin.AUCTION_ADMIN] : {
			'trackId': 15,
			'description': 'Origin for starting auctions.',
			'group': 'Main',
			'name': 'auction_admin',
			'maxDeciding': 10,
			'decisionDeposit': 166666666665000,
			'preparePeriod': 1200,
			'decisionPeriod': 201600,
			'confirmPeriod': 1800,
			'minEnactmentPeriod': 100,
			'minApproval': {
				'reciprocal': {
					'factor': 222222224,
					'xOffset': 333333335,
					'yOffset': 333333332
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 49586777,
					'xOffset': 90909091,
					'yOffset': -45454546
				}
			}
		},
		[PostOrigin.REFERENDUM_CANCELLER] : {
			'trackId': 20,
			'description': 'Origin able to cancel referenda.',
			'group': 'Governance',
			'name': 'referendum_canceller',
			'maxDeciding': 1000,
			'decisionDeposit': 333333333330000,
			'preparePeriod': 1200,
			'decisionPeriod': 100800,
			'confirmPeriod': 1800,
			'minEnactmentPeriod': 100,
			'minApproval': {
				'linearDecreasing': {
					'length': 607142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 7892829,
					'xOffset': 15544040,
					'yOffset': -7772020
				}
			}
		},
		[PostOrigin.REFERENDUM_KILLER] : {
			'trackId': 21,
			'description': 'Origin able to kill referenda.',
			'group': 'Governance',
			'name': 'referendum_killer',
			'maxDeciding': 1000,
			'decisionDeposit': 1666666666650000,
			'preparePeriod': 1200,
			'decisionPeriod': 201600,
			'confirmPeriod': 1800,
			'minEnactmentPeriod': 100,
			'minApproval': {
				'linearDecreasing': {
					'length': 607142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 7892829,
					'xOffset': 15544040,
					'yOffset': -7772020
				}
			}
		},
		[PostOrigin.SMALL_TIPPER] : {
			'trackId': 30,
			'description': 'Origin able to spend up to 1 KSM from the treasury at once.',
			'group': 'Treasury',
			'name': 'small_tipper',
			'maxDeciding': 200,
			'decisionDeposit': 33333333333,
			'preparePeriod': 10,
			'decisionPeriod': 100800,
			'confirmPeriod': 100,
			'minEnactmentPeriod': 10,
			'minApproval': {
				'linearDecreasing': {
					'length': 357142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 1620729,
					'xOffset': 3231018,
					'yOffset': -1615509
				}
			}
		},
		[PostOrigin.BIG_TIPPER] : {
			'trackId': 31,
			'description': 'Origin able to spend up to 5 KSM from the treasury at once.',
			'group': 'Treasury',
			'name': 'big_tipper',
			'maxDeciding': 100,
			'decisionDeposit': 333333333330,
			'preparePeriod': 100,
			'decisionPeriod': 100800,
			'confirmPeriod': 600,
			'minEnactmentPeriod': 100,
			'minApproval': {
				'linearDecreasing': {
					'length': 357142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 4149097,
					'xOffset': 8230453,
					'yOffset': -4115227
				}
			}
		},
		[PostOrigin.SMALL_SPENDER] : {
			'trackId': 32,
			'description': 'Origin able to spend up to 333 KSM from the treasury at once.',
			'group': 'Treasury',
			'name': 'small_spender',
			'maxDeciding': 50,
			'decisionDeposit': 3333333333300,
			'preparePeriod': 2400,
			'decisionPeriod': 201600,
			'confirmPeriod': 7200,
			'minEnactmentPeriod': 14400,
			'minApproval': {
				'linearDecreasing': {
					'length': 607142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 7892829,
					'xOffset': 15544040,
					'yOffset': -7772020
				}
			}
		},
		[PostOrigin.MEDIUM_SPENDER] : {
			'trackId': 33,
			'description': 'Origin able to spend up to 3,333 KSM from the treasury at once.',
			'group': 'Treasury',
			'name': 'medium_spender',
			'maxDeciding': 50,
			'decisionDeposit': 6666666666600,
			'preparePeriod': 2400,
			'decisionPeriod': 201600,
			'confirmPeriod': 14400,
			'minEnactmentPeriod': 14400,
			'minApproval': {
				'linearDecreasing': {
					'length': 821428571,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 14377233,
					'xOffset': 27972031,
					'yOffset': -13986016
				}
			}
		},
		[PostOrigin.BIG_SPENDER] : {
			'trackId': 34,
			'description': 'Origin able to spend up to 33,333 KSM from the treasury at once.',
			'group': 'Treasury',
			'name': 'big_spender',
			'maxDeciding': 50,
			'decisionDeposit': 13333333333200,
			'preparePeriod': 2400,
			'decisionPeriod': 201600,
			'confirmPeriod': 28800,
			'minEnactmentPeriod': 14400,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 28326977,
					'xOffset': 53763445,
					'yOffset': -26881723
				}
			}
		},
		[PostOrigin.CANDIDATES] : {
			'fellowshipOrigin': true,
			'description': 'Origin commanded by any members of the Polkadot Fellowship (no Dan grade needed)',
			'trackId': 0,
			'name': 'candidates',
			'maxDeciding': 10,
			'decisionDeposit': 3333333333300,
			'preparePeriod': 300,
			'decisionPeriod': 100800,
			'confirmPeriod': 300,
			'minEnactmentPeriod': 10,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.MEMBERS] : {
			'fellowshipOrigin': true,
			'trackId': 1,
			'description': 'Origin commanded by rank 1 of the Polkadot Fellowship and with a success of 1',
			'name': 'members',
			'maxDeciding': 10,
			'decisionDeposit': 333333333330,
			'preparePeriod': 300,
			'decisionPeriod': 100800,
			'confirmPeriod': 300,
			'minEnactmentPeriod': 10,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.PROFICIENTS] : {
			'fellowshipOrigin': true,
			'trackId': 2,
			'description': 'Origin commanded by rank 2 of the Polkadot Fellowship and with a success of 2',
			'name': 'proficients',
			'maxDeciding': 10,
			'decisionDeposit': 333333333330,
			'preparePeriod': 300,
			'decisionPeriod': 100800,
			'confirmPeriod': 300,
			'minEnactmentPeriod': 10,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.FELLOWS] : {
			'fellowshipOrigin': true,
			'trackId': 3,
			'description': 'Origin commanded by Polkadot Fellows (3rd Dan fellows or greater)',
			'name': 'fellows',
			'maxDeciding': 10,
			'decisionDeposit': 333333333330,
			'preparePeriod': 300,
			'decisionPeriod': 100800,
			'confirmPeriod': 300,
			'minEnactmentPeriod': 10,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.SENIOR_FELLOWS] : {
			'fellowshipOrigin': true,
			'trackId': 4,
			'description': 'Origin commanded by rank 4 of the Polkadot Fellowship and with a success of 4',
			'name': 'senior fellows',
			'maxDeciding': 10,
			'decisionDeposit': 333333333330,
			'preparePeriod': 300,
			'decisionPeriod': 100800,
			'confirmPeriod': 300,
			'minEnactmentPeriod': 10,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.EXPERTS] : {
			'fellowshipOrigin': true,
			'trackId': 5,
			'description': 'Origin commanded by Polkadot Experts (5th Dan fellows or greater)',
			'name': 'experts',
			'maxDeciding': 10,
			'decisionDeposit': 33333333333,
			'preparePeriod': 300,
			'decisionPeriod': 100800,
			'confirmPeriod': 300,
			'minEnactmentPeriod': 10,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.SENIOR_EXPERTS] : {
			'fellowshipOrigin': true,
			'trackId': 6,
			'description': 'Origin commanded by rank 6 of the Polkadot Fellowship and with a success of 6',
			'name': 'senior experts',
			'maxDeciding': 10,
			'decisionDeposit': 33333333333,
			'preparePeriod': 300,
			'decisionPeriod': 100800,
			'confirmPeriod': 300,
			'minEnactmentPeriod': 10,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.MASTERS] : {
			'fellowshipOrigin': true,
			'trackId': 7,
			'description': 'Origin commanded by Polkadot Masters (7th Dan fellows of greater)',
			'name': 'masters',
			'maxDeciding': 10,
			'decisionDeposit': 33333333333,
			'preparePeriod': 300,
			'decisionPeriod': 100800,
			'confirmPeriod': 300,
			'minEnactmentPeriod': 10,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.SENIOR_MASTERS] : {
			'fellowshipOrigin': true,
			'trackId': 8,
			'description': 'Origin commanded by rank 8 of the Polkadot Fellowship and with a success of 8',
			'name': 'senior masters',
			'maxDeciding': 10,
			'decisionDeposit': 33333333333,
			'preparePeriod': 300,
			'decisionPeriod': 100800,
			'confirmPeriod': 300,
			'minEnactmentPeriod': 10,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.GRAND_MASTERS] : {
			'fellowshipOrigin': true,
			'trackId': 9,
			'description': 'Origin commanded by rank 9 of the Polkadot Fellowship and with a success of 9',
			'name': 'grand masters',
			'maxDeciding': 10,
			'decisionDeposit': 33333333333,
			'preparePeriod': 300,
			'decisionPeriod': 100800,
			'confirmPeriod': 300,
			'minEnactmentPeriod': 10,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		}
	},
	polkadot: {
		[PostOrigin.ROOT] : {
			'trackId': 0,
			'description': 'Origin for General network-wide improvements',
			'group': 'Main',
			'name': 'root',
			'maxDeciding': 1,
			'decisionDeposit': 1000000000000000,
			'preparePeriod': 1200,
			'decisionPeriod': 403200,
			'confirmPeriod': 14400,
			'minEnactmentPeriod': 14400,
			'minApproval': {
				'reciprocal': {
					'factor': 222222224,
					'xOffset': 333333335,
					'yOffset': 333333332
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.WHITELISTED_CALLER] : {
			'trackId': 1,
			'description': 'Origin commanded by any members of the Polkadot Fellowship (no Dan grade needed)',
			'group': 'Whitelist',
			'name': 'whitelisted_caller',
			'maxDeciding': 100,
			'decisionDeposit': 100000000000000,
			'preparePeriod': 300,
			'decisionPeriod': 403200,
			'confirmPeriod': 100,
			'minEnactmentPeriod': 100,
			'minApproval': {
				'reciprocal': {
					'factor': 270899180,
					'xOffset': 389830523,
					'yOffset': 305084738
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 8650766,
					'xOffset': 18867926,
					'yOffset': 41509433
				}
			}
		},
		[PostOrigin.STAKING_ADMIN] : {
			'trackId': 10,
			'description': 'Origin for cancelling slashes.',
			'group': 'Main',
			'name': 'staking_admin',
			'maxDeciding': 10,
			'decisionDeposit': 50000000000000,
			'preparePeriod': 1200,
			'decisionPeriod': 403200,
			'confirmPeriod': 1800,
			'minEnactmentPeriod': 100,
			'minApproval': {
				'linearDecreasing': {
					'length': 607142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 7892829,
					'xOffset': 15544040,
					'yOffset': -7772020
				}
			}
		},
		[PostOrigin.TREASURER] : {
			'trackId': 11,
			'description': 'Origin for spending (any amount of) funds until the upper limit of  10,000,000 DOT',
			'group': 'Treasury',
			'name': 'treasurer',
			'maxDeciding': 10,
			'decisionDeposit': 10000000000000,
			'preparePeriod': 1200,
			'decisionPeriod': 403200,
			'confirmPeriod': 1800,
			'minEnactmentPeriod': 14400,
			'minApproval': {
				'reciprocal': {
					'factor': 222222224,
					'xOffset': 333333335,
					'yOffset': 333333332
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.LEASE_ADMIN] : {
			'trackId': 12,
			'description': 'Origin able to force slot leases',
			'group': 'Governance',
			'name': 'lease_admin',
			'maxDeciding': 10,
			'decisionDeposit': 50000000000000,
			'preparePeriod': 1200,
			'decisionPeriod': 403200,
			'confirmPeriod': 1800,
			'minEnactmentPeriod': 100,
			'minApproval': {
				'linearDecreasing': {
					'length': 607142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 7892829,
					'xOffset': 15544040,
					'yOffset': -7772020
				}
			}
		},
		[PostOrigin.FELLOWSHIP_ADMIN] : {
			'trackId': 13,
			'description': 'Origin for managing the composition of the fellowship',
			'group': 'Whitelist',
			'name': 'fellowship_admin',
			'maxDeciding': 10,
			'decisionDeposit': 50000000000000,
			'preparePeriod': 1200,
			'decisionPeriod': 403200,
			'confirmPeriod': 1800,
			'minEnactmentPeriod': 100,
			'minApproval': {
				'linearDecreasing': {
					'length': 607142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 7892829,
					'xOffset': 15544040,
					'yOffset': -7772020
				}
			}
		},
		[PostOrigin.GENERAL_ADMIN] : {
			'trackId': 14,
			'description': 'Origin for managing the registrar',
			'group': 'Governance',
			'name': 'general_admin',
			'maxDeciding': 10,
			'decisionDeposit': 50000000000000,
			'preparePeriod': 1200,
			'decisionPeriod': 403200,
			'confirmPeriod': 1800,
			'minEnactmentPeriod': 100,
			'minApproval': {
				'reciprocal': {
					'factor': 222222224,
					'xOffset': 333333335,
					'yOffset': 333333332
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 49586777,
					'xOffset': 90909091,
					'yOffset': -45454546
				}
			}
		},
		[PostOrigin.AUCTION_ADMIN] : {
			'trackId': 15,
			'description': 'Origin for starting auctions.',
			'group': 'Main',
			'name': 'auction_admin',
			'maxDeciding': 10,
			'decisionDeposit': 50000000000000,
			'preparePeriod': 1200,
			'decisionPeriod': 403200,
			'confirmPeriod': 1800,
			'minEnactmentPeriod': 100,
			'minApproval': {
				'reciprocal': {
					'factor': 222222224,
					'xOffset': 333333335,
					'yOffset': 333333332
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 49586777,
					'xOffset': 90909091,
					'yOffset': -45454546
				}
			}
		},
		[PostOrigin.REFERENDUM_CANCELLER] : {
			'trackId': 20,
			'description': 'Origin able to cancel referenda.',
			'group': 'Governance',
			'name': 'referendum_canceller',
			'maxDeciding': 1000,
			'decisionDeposit': 100000000000000,
			'preparePeriod': 1200,
			'decisionPeriod': 100800,
			'confirmPeriod': 1800,
			'minEnactmentPeriod': 100,
			'minApproval': {
				'linearDecreasing': {
					'length': 607142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 7892829,
					'xOffset': 15544040,
					'yOffset': -7772020
				}
			}
		},
		[PostOrigin.REFERENDUM_KILLER] : {
			'trackId': 21,
			'description': 'Origin able to kill referenda.',
			'group': 'Governance',
			'name': 'referendum_killer',
			'maxDeciding': 1000,
			'decisionDeposit': 500000000000000,
			'preparePeriod': 1200,
			'decisionPeriod': 403200,
			'confirmPeriod': 1800,
			'minEnactmentPeriod': 100,
			'minApproval': {
				'linearDecreasing': {
					'length': 607142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 7892829,
					'xOffset': 15544040,
					'yOffset': -7772020
				}
			}
		},
		[PostOrigin.SMALL_TIPPER] : {
			'trackId': 30,
			'description': 'Origin able to spend up to 250 DOT from the treasury at once',
			'group': 'Treasury',
			'name': 'small_tipper',
			'maxDeciding': 200,
			'decisionDeposit': 10000000000,
			'preparePeriod': 10,
			'decisionPeriod': 100800,
			'confirmPeriod': 100,
			'minEnactmentPeriod': 10,
			'minApproval': {
				'linearDecreasing': {
					'length': 357142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 1620729,
					'xOffset': 3231018,
					'yOffset': -1615509
				}
			}
		},
		[PostOrigin.BIG_TIPPER] : {
			'trackId': 31,
			'description': 'Origin able to spend up to 1000 DOT from the treasury at once',
			'group': 'Treasury',
			'name': 'big_tipper',
			'maxDeciding': 100,
			'decisionDeposit': 100000000000,
			'preparePeriod': 100,
			'decisionPeriod': 100800,
			'confirmPeriod': 600,
			'minEnactmentPeriod': 100,
			'minApproval': {
				'linearDecreasing': {
					'length': 357142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 4149097,
					'xOffset': 8230453,
					'yOffset': -4115227
				}
			}
		},
		[PostOrigin.SMALL_SPENDER] : {
			'trackId': 32,
			'description': 'Origin able to spend up to 10,000 DOT from the treasury at once',
			'group': 'Treasury',
			'name': 'small_spender',
			'maxDeciding': 50,
			'decisionDeposit': 1000000000000,
			'preparePeriod': 2400,
			'decisionPeriod': 403200,
			'confirmPeriod': 7200,
			'minEnactmentPeriod': 14400,
			'minApproval': {
				'linearDecreasing': {
					'length': 607142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 7892829,
					'xOffset': 15544040,
					'yOffset': -7772020
				}
			}
		},
		[PostOrigin.MEDIUM_SPENDER] : {
			'trackId': 33,
			'description': 'Origin able to spend up to 100,000 DOT from the treasury at once',
			'group': 'Treasury',
			'name': 'medium_spender',
			'maxDeciding': 50,
			'decisionDeposit': 2000000000000,
			'preparePeriod': 2400,
			'decisionPeriod': 403200,
			'confirmPeriod': 14400,
			'minEnactmentPeriod': 14400,
			'minApproval': {
				'linearDecreasing': {
					'length': 821428571,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 14377233,
					'xOffset': 27972031,
					'yOffset': -13986016
				}
			}
		},
		[PostOrigin.BIG_SPENDER] : {
			'trackId': 34,
			'description': 'Origin able to spend up to 1,000,000 DOT from the treasury at once',
			'group': 'Treasury',
			'name': 'big_spender',
			'maxDeciding': 50,
			'decisionDeposit': 4000000000000,
			'preparePeriod': 2400,
			'decisionPeriod': 403200,
			'confirmPeriod': 28800,
			'minEnactmentPeriod': 14400,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 28326977,
					'xOffset': 53763445,
					'yOffset': -26881723
				}
			}
		}
	},
	vara : {
		[PostOrigin.ROOT] : {
			'trackId': 0,
			'description': 'Origin for General network-wide improvements',
			'group': 'Main',
			'name': 'root',
			'maxDeciding': 1,
			'decisionDeposit': '0x00000000000000001bc16d674ec80000',
			'preparePeriod': 3600,
			'decisionPeriod': 604800,
			'confirmPeriod': 43200,
			'minEnactmentPeriod': 43200,
			'minApproval': {
				'reciprocal': {
					'factor': 222222224,
					'xOffset': 333333335,
					'yOffset': 333333332
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.WHITELISTED_CALLER] : {
			'trackId': 1,
			'description': 'Origin able to dispatch a whitelisted call.',
			'group': 'Whitelist',
			'name': 'whitelisted_caller',
			'maxDeciding': 100,
			'decisionDeposit': '0x000000000000000002c68af0bb140000',
			'preparePeriod': 900,
			'decisionPeriod': 604800,
			'confirmPeriod': 300,
			'minEnactmentPeriod': 300,
			'minApproval': {
				'reciprocal': {
					'factor': 270899180,
					'xOffset': 389830523,
					'yOffset': 305084738
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 8650766,
					'xOffset': 18867926,
					'yOffset': 41509433
				}
			}
		},
		[PostOrigin.STAKING_ADMIN] : {
			'trackId': 10,
			'description': 'Origin for cancelling slashes.',
			'group': 'Main',
			'name': 'staking_admin',
			'maxDeciding': 10,
			'decisionDeposit': '0x0000000000000000016345785d8a0000',
			'preparePeriod': 3600,
			'decisionPeriod': 604800,
			'confirmPeriod': 5400,
			'minEnactmentPeriod': 300,
			'minApproval': {
				'linearDecreasing': {
					'length': 607142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 7892829,
					'xOffset': 15544040,
					'yOffset': -7772020
				}
			}
		},
		[PostOrigin.TREASURER] : {
			'trackId': 11,
			'description': 'Origin for spending (any amount of) funds.',
			'group': 'Treasury',
			'name': 'treasurer',
			'maxDeciding': 10,
			'decisionDeposit': '0x000000000000000000470de4df820000',
			'preparePeriod': 3600,
			'decisionPeriod': 604800,
			'confirmPeriod': 5400,
			'minEnactmentPeriod': 43200,
			'minApproval': {
				'reciprocal': {
					'factor': 222222224,
					'xOffset': 333333335,
					'yOffset': 333333332
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.FELLOWSHIP_ADMIN] : {
			'trackId': 12,
			'description': 'Origin for managing the composition of the fellowship.',
			'group': 'Whitelist',
			'name': 'fellowship_admin',
			'maxDeciding': 10,
			'decisionDeposit': '0x0000000000000000016345785d8a0000',
			'preparePeriod': 3600,
			'decisionPeriod': 604800,
			'confirmPeriod': 5400,
			'minEnactmentPeriod': 300,
			'minApproval': {
				'linearDecreasing': {
					'length': 607142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 7892829,
					'xOffset': 15544040,
					'yOffset': -7772020
				}
			}
		},
		[PostOrigin.GENERAL_ADMIN] : {
			'trackId': 13,
			'description': 'Origin for managing the registrar.',
			'group': 'Governance',
			'name': 'general_admin',
			'maxDeciding': 10,
			'decisionDeposit': '0x0000000000000000016345785d8a0000',
			'preparePeriod': 3600,
			'decisionPeriod': 604800,
			'confirmPeriod': 5400,
			'minEnactmentPeriod': 300,
			'minApproval': {
				'reciprocal': {
					'factor': 222222224,
					'xOffset': 333333335,
					'yOffset': 333333332
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 49586777,
					'xOffset': 90909091,
					'yOffset': -45454546
				}
			}
		},
		[PostOrigin.REFERENDUM_CANCELLER] : {
			'trackId': 20,
			'description': 'Origin able to cancel referenda.',
			'group': 'Governance',
			'name': 'referendum_canceller',
			'maxDeciding': 1000,
			'decisionDeposit': '0x000000000000000002c68af0bb140000',
			'preparePeriod': 3600,
			'decisionPeriod': 302400,
			'confirmPeriod': 5400,
			'minEnactmentPeriod': 300,
			'minApproval': {
				'linearDecreasing': {
					'length': 607142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 7892829,
					'xOffset': 15544040,
					'yOffset': -7772020
				}
			}
		},
		[PostOrigin.REFERENDUM_KILLER] : {
			'trackId': 21,
			'description': 'Origin able to kill referenda.',
			'group': 'Governance',
			'name': 'referendum_killer',
			'maxDeciding': 1000,
			'decisionDeposit': '0x00000000000000000de0b6b3a7640000',
			'preparePeriod': 3600,
			'decisionPeriod': 604800,
			'confirmPeriod': 5400,
			'minEnactmentPeriod': 300,
			'minApproval': {
				'linearDecreasing': {
					'length': 607142857,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 7892829,
					'xOffset': 15544040,
					'yOffset': -7772020
				}
			}
		},
		[PostOrigin.CANDIDATES] : {
			'fellowshipOrigin': true,
			'trackId': 0,
			'description': 'Origin commanded by any members of the Polkadot Fellowship (no Dan grade needed)',
			'name': 'candidates',
			'maxDeciding': 10,
			'decisionDeposit': 2000000000000000,
			'preparePeriod': 900,
			'decisionPeriod': 302400,
			'confirmPeriod': 900,
			'minEnactmentPeriod': 30,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.FELLOWS] : {
			'fellowshipOrigin': true,
			'trackId': 1,
			'description': 'Origin commanded by Polkadot Fellows (3rd Dan fellows or greater)',
			'name': 'fellows',
			'maxDeciding': 10,
			'decisionDeposit': 200000000000000,
			'preparePeriod': 900,
			'decisionPeriod': 302400,
			'confirmPeriod': 900,
			'minEnactmentPeriod': 30,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}

		},
		[PostOrigin.EXPERTS] : {
			'fellowshipOrigin': true,
			'trackId': 2,
			'description': 'Origin commanded by Polkadot Experts (5th Dan fellows or greater)',
			'name': 'experts',
			'maxDeciding': 10,
			'decisionDeposit': 20000000000000,
			'preparePeriod': 900,
			'decisionPeriod': 302400,
			'confirmPeriod': 900,
			'minEnactmentPeriod': 30,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.MASTERS] : {
			'fellowshipOrigin': true,
			'trackId': 3,
			'description': 'Origin commanded by Polkadot Masters (7th Dan fellows of greater)',
			'name': 'masters',
			'maxDeciding': 10,
			'decisionDeposit': 20000000000000,
			'preparePeriod': 900,
			'decisionPeriod': 302400,
			'confirmPeriod': 900,
			'minEnactmentPeriod': 30,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		}
	},
	moonbase: {
		[PostOrigin.ROOT] : {
			'trackId': 0,
			'description': 'Origin for General network-wide improvements',
			'group': 'Main',
			'name': 'root',
			'maxDeciding': 5,
			'decisionDeposit': '0x000000000000152d02c7e14af6800000',
			'preparePeriod': 7200,
			'decisionPeriod': 100800,
			'confirmPeriod': 7200,
			'minEnactmentPeriod': 7200,
			'minApproval': {
				'reciprocal': {
					'factor': 999999999,
					'xOffset': 999999999,
					'yOffset': 0
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 5000000,
					'ceil': 250000000
				}
			}
		},
		[PostOrigin.WHITELISTED_CALLER] : {
			'trackId': 1,
			'description': 'Origin able to dispatch a whitelisted call.',
			'group': 'Whitelist',
			'name': 'whitelisted_caller',
			'maxDeciding': 100,
			'decisionDeposit': '0x000000000000021e19e0c9bab2400000',
			'preparePeriod': 50,
			'decisionPeriod': 100800,
			'confirmPeriod': 50,
			'minEnactmentPeriod': 150,
			'minApproval': {
				'reciprocal': {
					'factor': 999999999,
					'xOffset': 999999999,
					'yOffset': 0
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 60061,
					'xOffset': 2994150,
					'yOffset': -59882
				}
			}
		},
		[PostOrigin.GENERAL_ADMIN] : {
			'trackId': 2,
			'description': 'Origin for managing the registrar.',
			'group': 'Governance',
			'name': 'general_admin',
			'maxDeciding': 10,
			'decisionDeposit': '0x000000000000001b1ae4d6e2ef500000',
			'preparePeriod': 300,
			'decisionPeriod': 100800,
			'confirmPeriod': 7200,
			'minEnactmentPeriod': 7200,
			'minApproval': {
				'reciprocal': {
					'factor': 999999999,
					'xOffset': 999999999,
					'yOffset': 0
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 222222224,
					'xOffset': 333333335,
					'yOffset': -166666668
				}
			}
		},
		[PostOrigin.REFERENDUM_CANCELLER] : {
			'trackId': 3,
			'description': 'Origin able to cancel referenda.',
			'group': 'Governance',
			'name': 'referendum_canceller',
			'maxDeciding': 20,
			'decisionDeposit': '0x000000000000021e19e0c9bab2400000',
			'preparePeriod': 300,
			'decisionPeriod': 100800,
			'confirmPeriod': 900,
			'minEnactmentPeriod': 50,
			'minApproval': {
				'reciprocal': {
					'factor': 999999999,
					'xOffset': 999999999,
					'yOffset': 0
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 787400,
					'xOffset': 1572327,
					'yOffset': -786164
				}
			}
		},
		[PostOrigin.REFERENDUM_KILLER] : {
			'trackId': 4,
			'description': 'Origin able to kill referenda.',
			'group': 'Governance',
			'name': 'referendum_killer',
			'maxDeciding': 100,
			'decisionDeposit': '0x000000000000043c33c1937564800000',
			'preparePeriod': 300,
			'decisionPeriod': 100800,
			'confirmPeriod': 900,
			'minEnactmentPeriod': 50,
			'minApproval': {
				'reciprocal': {
					'factor': 999999999,
					'xOffset': 999999999,
					'yOffset': 0
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 869501,
					'xOffset': 8620680,
					'yOffset': -862069
				}
			}
		}
	},
	moonriver: {
		[PostOrigin.ROOT] : {
			'trackId': 0,
			'description': 'Origin for General network-wide improvements',
			'group': 'Main',
			'name': 'root',
			'maxDeciding': 5,
			'decisionDeposit': '0x000000000000152d02c7e14af6800000',
			'preparePeriod': 7200,
			'decisionPeriod': 100800,
			'confirmPeriod': 7200,
			'minEnactmentPeriod': 7200,
			'minApproval': {
				'reciprocal': {
					'factor': 999999999,
					'xOffset': 999999999,
					'yOffset': 0
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 5000000,
					'ceil': 250000000
				}
			}
		},
		[PostOrigin.WHITELISTED_CALLER] : {
			'trackId': 1,
			'description': 'Origin able to dispatch a whitelisted call.',
			'group': 'Whitelist',
			'name': 'whitelisted_caller',
			'maxDeciding': 100,
			'decisionDeposit': '0x000000000000021e19e0c9bab2400000',
			'preparePeriod': 50,
			'decisionPeriod': 100800,
			'confirmPeriod': 50,
			'minEnactmentPeriod': 150,
			'minApproval': {
				'reciprocal': {
					'factor': 999999999,
					'xOffset': 999999999,
					'yOffset': 0
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 60061,
					'xOffset': 2994150,
					'yOffset': -59882
				}
			}
		},
		[PostOrigin.GENERAL_ADMIN] : {
			'trackId': 2,
			'description': 'Origin for managing the registrar.',
			'group': 'Governance',
			'name': 'general_admin',
			'maxDeciding': 10,
			'decisionDeposit': '0x000000000000001b1ae4d6e2ef500000',
			'preparePeriod': 300,
			'decisionPeriod': 100800,
			'confirmPeriod': 7200,
			'minEnactmentPeriod': 7200,
			'minApproval': {
				'reciprocal': {
					'factor': 999999999,
					'xOffset': 999999999,
					'yOffset': 0
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 222222224,
					'xOffset': 333333335,
					'yOffset': -166666668
				}
			}
		},
		[PostOrigin.REFERENDUM_CANCELLER] : {
			'trackId': 3,
			'description': 'Origin able to cancel referenda.',
			'group': 'Governance',
			'name': 'referendum_canceller',
			'maxDeciding': 20,
			'decisionDeposit': '0x000000000000021e19e0c9bab2400000',
			'preparePeriod': 300,
			'decisionPeriod': 100800,
			'confirmPeriod': 900,
			'minEnactmentPeriod': 50,
			'minApproval': {
				'reciprocal': {
					'factor': 999999999,
					'xOffset': 999999999,
					'yOffset': 0
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 787400,
					'xOffset': 1572327,
					'yOffset': -786164
				}
			}
		},
		[PostOrigin.REFERENDUM_KILLER] : {
			'trackId': 4,
			'description': 'Origin able to kill referenda.',
			'group': 'Governance',
			'name': 'referendum_killer',
			'maxDeciding': 100,
			'decisionDeposit': '0x000000000000043c33c1937564800000',
			'preparePeriod': 300,
			'decisionPeriod': 100800,
			'confirmPeriod': 900,
			'minEnactmentPeriod': 50,
			'minApproval': {
				'reciprocal': {
					'factor': 999999999,
					'xOffset': 999999999,
					'yOffset': 0
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 869501,
					'xOffset': 8620680,
					'yOffset': -862069
				}
			}
		}
	},
	moonbeam: {
		[PostOrigin.ROOT] : {
			'trackId': 0,
			'description': 'Origin for General network-wide improvements',
			'group': 'Main',
			'name': 'root',
			'maxDeciding': 5,
			'decisionDeposit': '0x000000000000152d02c7e14af6800000',
			'preparePeriod': 7200,
			'decisionPeriod': 100800,
			'confirmPeriod': 7200,
			'minEnactmentPeriod': 7200,
			'minApproval': {
				'reciprocal': {
					'factor': 999999999,
					'xOffset': 999999999,
					'yOffset': 0
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 5000000,
					'ceil': 250000000
				}
			}
		},
		[PostOrigin.WHITELISTED_CALLER] : {
			'trackId': 1,
			'description': 'Origin able to dispatch a whitelisted call.',
			'group': 'Whitelist',
			'name': 'whitelisted_caller',
			'maxDeciding': 100,
			'decisionDeposit': '0x000000000000021e19e0c9bab2400000',
			'preparePeriod': 50,
			'decisionPeriod': 100800,
			'confirmPeriod': 50,
			'minEnactmentPeriod': 150,
			'minApproval': {
				'reciprocal': {
					'factor': 999999999,
					'xOffset': 999999999,
					'yOffset': 0
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 60061,
					'xOffset': 2994150,
					'yOffset': -59882
				}
			}
		},
		[PostOrigin.GENERAL_ADMIN] : {
			'trackId': 2,
			'description': 'Origin for managing the registrar.',
			'group': 'Governance',
			'name': 'general_admin',
			'maxDeciding': 10,
			'decisionDeposit': '0x000000000000001b1ae4d6e2ef500000',
			'preparePeriod': 300,
			'decisionPeriod': 100800,
			'confirmPeriod': 7200,
			'minEnactmentPeriod': 7200,
			'minApproval': {
				'reciprocal': {
					'factor': 999999999,
					'xOffset': 999999999,
					'yOffset': 0
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 222222224,
					'xOffset': 333333335,
					'yOffset': -166666668
				}
			}
		},
		[PostOrigin.REFERENDUM_CANCELLER] : {
			'trackId': 3,
			'description': 'Origin able to cancel referenda.',
			'group': 'Governance',
			'name': 'referendum_canceller',
			'maxDeciding': 20,
			'decisionDeposit': '0x000000000000021e19e0c9bab2400000',
			'preparePeriod': 300,
			'decisionPeriod': 100800,
			'confirmPeriod': 900,
			'minEnactmentPeriod': 50,
			'minApproval': {
				'reciprocal': {
					'factor': 999999999,
					'xOffset': 999999999,
					'yOffset': 0
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 787400,
					'xOffset': 1572327,
					'yOffset': -786164
				}
			}
		},
		[PostOrigin.REFERENDUM_KILLER] : {
			'trackId': 4,
			'description': 'Origin able to kill referenda.',
			'group': 'Governance',
			'name': 'referendum_killer',
			'maxDeciding': 100,
			'decisionDeposit': '0x000000000000043c33c1937564800000',
			'preparePeriod': 300,
			'decisionPeriod': 100800,
			'confirmPeriod': 900,
			'minEnactmentPeriod': 50,
			'minApproval': {
				'reciprocal': {
					'factor': 999999999,
					'xOffset': 999999999,
					'yOffset': 0
				}
			},
			'minSupport': {
				'reciprocal': {
					'factor': 869501,
					'xOffset': 8620680,
					'yOffset': -862069
				}
			}
		}
	},
	collectives: {
		[PostOrigin.CANDIDATES] : {
			'fellowshipOrigin': true,
			'description': 'Origin commanded by any members of the Polkadot Fellowship (no Dan grade needed)',
			'trackId': 0,
			'name': 'candidates',
			'maxDeciding': 10,
			'decisionDeposit': 1000000000000,
			'preparePeriod': 150,
			'decisionPeriod': 50400,
			'confirmPeriod': 150,
			'minEnactmentPeriod': 5,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.MEMBERS] : {
			'fellowshipOrigin': true,
			'trackId': 1,
			'description': 'Origin commanded by rank 1 of the Polkadot Fellowship and with a success of 1',
			'name': 'members',
			'maxDeciding': 10,
			'decisionDeposit': 100000000000,
			'preparePeriod': 150,
			'decisionPeriod': 50400,
			'confirmPeriod': 150,
			'minEnactmentPeriod': 5,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.PROFICIENTS] : {
			'fellowshipOrigin': true,
			'trackId': 2,
			'description': 'Origin commanded by rank 2 of the Polkadot Fellowship and with a success of 2',
			'name': 'proficients',
			'maxDeciding': 10,
			'decisionDeposit': 100000000000,
			'preparePeriod': 150,
			'decisionPeriod': 50400,
			'confirmPeriod': 150,
			'minEnactmentPeriod': 5,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.FELLOWS] : {
			'fellowshipOrigin': true,
			'trackId': 3,
			'description': 'Origin commanded by Polkadot Fellows (3rd Dan fellows or greater)',
			'name': 'fellows',
			'maxDeciding': 10,
			'decisionDeposit': 100000000000,
			'preparePeriod': 150,
			'decisionPeriod': 50400,
			'confirmPeriod': 150,
			'minEnactmentPeriod': 5,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.SENIOR_FELLOWS] : {
			'fellowshipOrigin': true,
			'trackId': 4,
			'description': 'Origin commanded by rank 4 of the Polkadot Fellowship and with a success of 4',
			'name': 'fellows',
			'maxDeciding': 10,
			'decisionDeposit': 100000000000,
			'preparePeriod': 150,
			'decisionPeriod': 50400,
			'confirmPeriod': 150,
			'minEnactmentPeriod': 5,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.EXPERTS] : {
			'fellowshipOrigin': true,
			'trackId': 5,
			'description': 'Origin commanded by Polkadot Experts (5th Dan fellows or greater)',
			'name': 'fellows',
			'maxDeciding': 10,
			'decisionDeposit': 100000000000,
			'preparePeriod': 150,
			'decisionPeriod': 50400,
			'confirmPeriod': 150,
			'minEnactmentPeriod': 5,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.SENIOR_EXPERTS] : {
			'fellowshipOrigin': true,
			'trackId': 6,
			'description': 'Origin commanded by rank 6 of the Polkadot Fellowship and with a success of 6',
			'name': 'fellows',
			'maxDeciding': 10,
			'decisionDeposit': 100000000000,
			'preparePeriod': 150,
			'decisionPeriod': 50400,
			'confirmPeriod': 150,
			'minEnactmentPeriod': 5,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.MASTERS] : {
			'fellowshipOrigin': true,
			'trackId': 7,
			'description': 'Origin commanded by Polkadot Masters (7th Dan fellows of greater)',
			'name': 'fellows',
			'maxDeciding': 10,
			'decisionDeposit': 100000000000,
			'preparePeriod': 150,
			'decisionPeriod': 50400,
			'confirmPeriod': 150,
			'minEnactmentPeriod': 5,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.SENIOR_MASTERS] : {
			'fellowshipOrigin': true,
			'trackId': 8,
			'description': 'Origin commanded by rank 8 of the Polkadot Fellowship and with a success of 8',
			'name': 'fellows',
			'maxDeciding': 10,
			'decisionDeposit': 100000000000,
			'preparePeriod': 150,
			'decisionPeriod': 50400,
			'confirmPeriod': 150,
			'minEnactmentPeriod': 5,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		},
		[PostOrigin.GRAND_MASTERS] : {
			'fellowshipOrigin': true,
			'trackId': 9,
			'description': 'Origin commanded by rank 9 of the Polkadot Fellowship and with a success of 9',
			'name': 'fellows',
			'maxDeciding': 10,
			'decisionDeposit': 100000000000,
			'preparePeriod': 150,
			'decisionPeriod': 50400,
			'confirmPeriod': 150,
			'minEnactmentPeriod': 5,
			'minApproval': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 500000000,
					'ceil': 1000000000
				}
			},
			'minSupport': {
				'linearDecreasing': {
					'length': 1000000000,
					'floor': 0,
					'ceil': 500000000
				}
			}
		}
	}
};