// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import { OpdsFeed } from "readium-desktop/common/models/opds";
import { IOpdsFeedView } from "readium-desktop/common/views/opds";
import { diMainGet } from "readium-desktop/main/di";
import { call, SagaGenerator } from "typed-redux-saga";
import { IDigestDataParsed } from "readium-desktop/utils/digest";
import { OPDSAuthenticationDoc } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-authentication-doc";
import { OPDSAuthentication } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-authentication";
import { OPDSAuthenticationLabels } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-authentication-labels";
import { getOpdsAuthenticationChannel } from "readium-desktop/main/event";
import { OPDSLink } from "r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-link";
import * as debug_ from "debug";

//Logger
const filename_ = "readium-desktop:main/http";
const debug = debug_(filename_);

/*

    public async getFeed(identifier: string): Promise<IOpdsFeedView> {
        const doc = await this.opdsFeedRepository.get(identifier);
        return this.opdsFeedViewConverter.convertDocumentToView(doc);
    }

    public async deleteFeed(identifier: string): Promise<void> {
        await this.opdsFeedRepository.delete(identifier);
    }

    public async findAllFeeds(): Promise<IOpdsFeedView[]> {
        const docs = await this.opdsFeedRepository.findAll();
        return docs.map((doc) => {
            return this.opdsFeedViewConverter.convertDocumentToView(doc);
        });
    }

    public async addFeed(data: OpdsFeed): Promise<IOpdsFeedView> {

        // ensures no duplicates (same URL ... but may be different titles)
        const opdsFeeds = await this.opdsFeedRepository.findAll();
        const found = opdsFeeds.find((o) => o.url === data.url);
        if (found) {
            return this.opdsFeedViewConverter.convertDocumentToView(found);
        }

        const doc = await this.opdsFeedRepository.save(data);
        return this.opdsFeedViewConverter.convertDocumentToView(doc);
    }

 */

export function* getFeed(identifier: string) {

    const opdsFeedViewConverter = diMainGet("opds-feed-view-converter");
    const opdsFeedRepository = diMainGet("opds-feed-repository");

    const doc = yield* call(() => opdsFeedRepository.get(identifier));
    return opdsFeedViewConverter.convertDocumentToView(doc);
}

export function* deleteFeed(identifier: string) {

    const opdsFeedRepository = diMainGet("opds-feed-repository");
    yield* call(() => opdsFeedRepository.delete(identifier));
}

export function* addFeed(data: OpdsFeed): SagaGenerator<IOpdsFeedView> {

    const opdsFeedRepository = diMainGet("opds-feed-repository");
    const opdsFeedViewConverter = diMainGet("opds-feed-view-converter");

    // ensures no duplicates (same URL ... but may be different titles)
    const opdsFeeds = yield* call(() => opdsFeedRepository.findAll());
    const found = opdsFeeds.find((o) => o.url === data.url);
    if (found) {
        return opdsFeedViewConverter.convertDocumentToView(found);
    }

    const doc = yield* call(() => opdsFeedRepository.save(data));
    return opdsFeedViewConverter.convertDocumentToView(doc);
}

export function* findAllFeeds(): SagaGenerator<IOpdsFeedView[]> {

    const opdsFeedRepository = diMainGet("opds-feed-repository");
    const opdsFeedViewConverter = diMainGet("opds-feed-view-converter");

    const docs = yield* call(() => opdsFeedRepository.findAll());
    return docs.map((doc) =>
        opdsFeedViewConverter.convertDocumentToView(doc));
}

export function* authorizeFeed(url: string) {
    sendWwwAuthenticationToAuthenticationProcess({
        type: "basic",
        username: "",
        realm: "",
        nonce: "",
        algorithm: "MD5",
        qop: "auth",
        cnonce: "",
        uri: "",
        nonceCount: "",
    }, url);
};

function sendWwwAuthenticationToAuthenticationProcess(
    data: IDigestDataParsed & {type: "digest" | "basic"},
    responseUrl: string,
) {

    const opdsAuthDoc = new OPDSAuthenticationDoc();

    opdsAuthDoc.Id = "";
    opdsAuthDoc.Title = ""; // realm || "basic authenticate"; NOT HUMAN-READABLE!

    const opdsAuth = new OPDSAuthentication();

    opdsAuth.Type = "http://opds-spec.org/auth/" + data.type;
    opdsAuth.AdditionalJSON = {...data};
    opdsAuth.Labels = new OPDSAuthenticationLabels();
    opdsAuth.Labels.Login = "LOGIN";
    opdsAuth.Labels.Password = "PASSWORD";

    const opdsLink = new OPDSLink();
    opdsLink.Rel = ["authenticate"];
    opdsLink.Href = responseUrl;

    opdsAuth.Links = [opdsLink];

    opdsAuthDoc.Authentication = [opdsAuth];

    dispatchAuthenticationProcess(opdsAuthDoc, responseUrl);
}

function dispatchAuthenticationProcess(r2OpdsAuth: OPDSAuthenticationDoc, responseUrl: string) {

    const opdsAuthChannel = getOpdsAuthenticationChannel();

    debug("put the authentication model in the saga authChannel", JSON.stringify(opdsAuthChannel, null, 4));
    opdsAuthChannel.put([r2OpdsAuth, responseUrl]);
}
