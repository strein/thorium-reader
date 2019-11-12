// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import { Action } from "readium-desktop/common/models/redux";
import { UpdateStatus } from "readium-desktop/common/redux/states/update";

export const ID = "UPDATE_LATEST_VERSION_SET";

export interface Payload {
    status: UpdateStatus;
    latestVersion: string;
    latestVersionUrl: string;
}

export function build(
    status: UpdateStatus,
    latestVersion: string,
    latestVersionUrl: string,
): Action<typeof ID, Payload> {

    return {
        type: ID,
        payload: {
            status,
            latestVersion,
            latestVersionUrl,
        },
    };
}
build.toString = () => ID; // Redux StringableActionCreator
export type TAction = ReturnType<typeof build>;
