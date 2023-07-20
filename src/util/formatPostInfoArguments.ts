// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export default function formatPostInfoArguments(rawArguments: any): any[] {
    const argumentsArr: any[] = [];
    rawArguments?.forEach((obj: any) => {
        if (obj.name == 'code') {
            return false;
        }

        const argumentsObj: any = {};
        delete obj.__typename;
        if (obj.id) {
            argumentsObj['id'] = obj.id;
        }
        argumentsObj['name'] = obj.name;
        try {
            argumentsObj['value'] = JSON.parse(obj.value);
        } catch {
            argumentsObj['value'] = obj.value;
        }
        argumentsArr.push(argumentsObj);
    });

    return argumentsArr;
}
