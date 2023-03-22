// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const MUTATION_RESET_PASSWORD = `
    mutation resetPassword($newPassword: String!, $userId: Int! $token: String!){
        resetPassword(newPassword: $newPassword, userId: $userId, token: $token){
            message
        }
    }
`;
