// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import classNames from "classnames";
import * as React from "react";
import { TPublication } from "readium-desktop/common/type/publication.type";
import { formatTime } from "readium-desktop/common/utils/time";
import { IOpdsBaseLinkView } from "readium-desktop/common/views/opds";
import * as stylesBookDetailsDialog from "readium-desktop/renderer/assets/styles/bookDetailsDialog.css";
import * as stylesColumns from "readium-desktop/renderer/assets/styles/components/columns.css";
import * as stylesPublications from "readium-desktop/renderer/assets/styles/components/publications.css";
import * as stylesGlobal from "readium-desktop/renderer/assets/styles/global.css";

import { TaJsonDeserialize } from "@r2-lcp-js/serializable";
import { LocatorExtended } from "@r2-navigator-js/electron/renderer";
import { Publication as R2Publication } from "@r2-shared-js/models/publication";

import Cover from "../../Cover";
import { FormatContributorWithLink } from "./FormatContributorWithLink";
import { FormatPublicationLanguage } from "./formatPublicationLanguage";
import { FormatPublisherDate } from "./formatPublisherDate";
import LcpInfo from "./LcpInfo";
import PublicationInfoDescription from "./PublicationInfoDescription";
import { convertMultiLangStringToString, langStringIsRTL } from "readium-desktop/renderer/common/language-string";
import PublicationInfoA11y from "./publicationInfoA11y";
import { PublicationView } from "readium-desktop/common/views/publication";
import { useTranslator } from "readium-desktop/renderer/common/hooks/useTranslator";
import Progression from "./Progression";

export interface IProps {
    publicationViewMaybeOpds: TPublication;
    r2Publication: R2Publication | null;
    manifestUrlR2Protocol: string | null;
    handleLinkUrl: ((url: string) => void) | undefined;
    toggleCoverZoomCb: (coverZoom: boolean) => void;
    ControlComponent?: React.ComponentType<any>;
    TagManagerComponent: React.ComponentType<any>;
    coverZoom: boolean;
    focusWhereAmI: boolean;
    pdfPlayerNumberOfPages: number | undefined; // super hacky :(
    divinaNumberOfPages: number | undefined; // super hacky :(
    divinaContinousEqualTrue: boolean;
    readerReadingLocation: LocatorExtended;
    onClikLinkCb?: (tag: IOpdsBaseLinkView) => () => void | undefined;
    closeDialogCb: () => void;
}

const Duration = (props: {duration: number}) => {
    const [__] = useTranslator();
    const { duration } = props;
    const sentence = formatTime(duration);
    if (!duration) {
        return <></>;
    }
    return (
        sentence
            ? <>
                <strong>{`${__("publication.duration.title")}: `}</strong>
                <i className={stylesBookDetailsDialog.allowUserSelect}>
                    {sentence}
                </i>
                <br />
            </>
            : <></>);
};

export const PublicationInfoContent: React.FC<IProps> = (props) => {

    // tslint:disable-next-line: max-line-length
    const { closeDialogCb,
        readerReadingLocation,
        pdfPlayerNumberOfPages,
        divinaNumberOfPages,
        divinaContinousEqualTrue,
        r2Publication: r2Publication_,
        manifestUrlR2Protocol,
        handleLinkUrl,
        publicationViewMaybeOpds,
        toggleCoverZoomCb,
        ControlComponent,
        TagManagerComponent,
        coverZoom,
        onClikLinkCb,
        focusWhereAmI
    } = props;

    const [__, translator] = useTranslator();

    const r2Publication = React.useMemo(() => {
        if (!r2Publication_ && publicationViewMaybeOpds.r2PublicationJson) {
            // debug("!! r2Publication ".repeat(100));
            return TaJsonDeserialize(publicationViewMaybeOpds.r2PublicationJson, R2Publication);
        }

        // debug("__r2Publication".repeat(100));
        return r2Publication_;

    }, [publicationViewMaybeOpds, r2Publication_]);

    const pubTitleLangStr = convertMultiLangStringToString(translator, (publicationViewMaybeOpds as PublicationView).publicationTitle || publicationViewMaybeOpds.documentTitle);
    const pubTitleLang = pubTitleLangStr && pubTitleLangStr[0] ? pubTitleLangStr[0].toLowerCase() : "";
    const pubTitleIsRTL = langStringIsRTL(pubTitleLang);
    const pubTitleStr = pubTitleLangStr && pubTitleLangStr[1] ? pubTitleLangStr[1] : "";

    const ProgressionComponent = React.memo(Progression, () => true);


    return (
        <>
            <div className={stylesColumns.row}>
                <div className={stylesColumns.col_book_img}>
                    <div className={stylesPublications.publication_image_wrapper}>
                        <Cover
                            publicationViewMaybeOpds={publicationViewMaybeOpds}
                            onClick={() => toggleCoverZoomCb(coverZoom)}
                            onKeyDown={
                                (e: React.KeyboardEvent<HTMLImageElement>) =>
                                    e.key === "Enter" && toggleCoverZoomCb(coverZoom)
                            }
                        ></Cover>
                    </div>
                    { ControlComponent && <ControlComponent /> }
                </div>
                <div className={stylesColumns.col}>
                    <section>
                        <h2 className={classNames(stylesBookDetailsDialog.allowUserSelect, stylesGlobal.my_10)}
                            dir={pubTitleIsRTL ? "rtl" : undefined}>
                            {pubTitleStr}
                        </h2>
                        <FormatContributorWithLink
                            contributors={publicationViewMaybeOpds.authors}
                            onClickLinkCb={onClikLinkCb}
                        />
                    </section>

                    <section>
                        <PublicationInfoDescription publicationViewMaybeOpds={publicationViewMaybeOpds} />
                    </section>
                    <section>
                        <div className={stylesGlobal.heading}>  
                            <h3>{__("catalog.moreInfo")}</h3>
                        </div>
                        <div>
                            <FormatPublisherDate publicationViewMaybeOpds={publicationViewMaybeOpds}/>
                            {
                                publicationViewMaybeOpds.publishers?.length ?
                                    <>
                                        <strong>{`${__("catalog.publisher")}: `}</strong>
                                        <i className={stylesBookDetailsDialog.allowUserSelect}>
                                            <FormatContributorWithLink
                                                contributors={publicationViewMaybeOpds.publishers}
                                                onClickLinkCb={onClikLinkCb}
                                            />
                                        </i>
                                        <br />
                                    </> : undefined
                            }
                            {
                                publicationViewMaybeOpds.languages?.length ?
                                    <>
                                        <strong>{`${__("catalog.lang")}: `}</strong>
                                        <FormatPublicationLanguage publicationViewMaybeOpds={publicationViewMaybeOpds} />
                                        <br />
                                    </> : undefined
                            }
                            {
                                publicationViewMaybeOpds.numberOfPages ?
                                    <>
                                        <strong>{`${__("catalog.numberOfPages")}: `}</strong>
                                        <i className={stylesBookDetailsDialog.allowUserSelect}>
                                            {publicationViewMaybeOpds.numberOfPages}
                                        </i>
                                        <br />

                                    </> : undefined
                            }
                            <Duration
                                duration={publicationViewMaybeOpds.duration}
                            />
                            {
                                publicationViewMaybeOpds.nbOfTracks ?
                                    <>
                                        <strong>{`${__("publication.audio.tracks")}: `}</strong>
                                        <i className={stylesBookDetailsDialog.allowUserSelect}>
                                            {publicationViewMaybeOpds.nbOfTracks}
                                        </i>
                                        <br />

                                    </> : undefined
                            }
                        </div>
                    </section>
                    <section>
                        <div className={stylesGlobal.heading}>
                            <h3>{__("publication.accessibility.name")}</h3>
                        </div>
                        <div>
                            <PublicationInfoA11y publicationViewMaybeOpds={publicationViewMaybeOpds}></PublicationInfoA11y>
                        </div>
                    </section>
                    {(publicationViewMaybeOpds.lcp ? <section>
                        <LcpInfo publicationLcp={publicationViewMaybeOpds} />
                    </section> : <></>)}
                    <section>
                        <div className={stylesGlobal.heading}>
                            <h3>{__("catalog.tags")}</h3>
                        </div>
                        <TagManagerComponent />
                    </section>
                        <ProgressionComponent
                            closeDialogCb={closeDialogCb}
                            r2Publication={r2Publication}
                            manifestUrlR2Protocol={manifestUrlR2Protocol}
                            handleLinkUrl={handleLinkUrl}
                            pdfPlayerNumberOfPages={pdfPlayerNumberOfPages}
                            divinaNumberOfPages={divinaNumberOfPages}
                            divinaContinousEqualTrue={divinaContinousEqualTrue}
                            focusWhereAmI={focusWhereAmI}
                            locatorExt={readerReadingLocation || publicationViewMaybeOpds.lastReadingLocation}
                        />
                </div>
            </div>
        </>
    );
};
