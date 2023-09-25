// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import classNames from "classnames";
import * as debug_ from "debug";
import * as DOMPurify from "dompurify";
import * as React from "react";
import { TPublication } from "readium-desktop/common/type/publication.type";
import * as stylesBookDetailsDialog from "readium-desktop/renderer/assets/styles/bookDetailsDialog.css";
import * as stylesBlocks from "readium-desktop/renderer/assets/styles/components/blocks.css";
import * as stylesButtons from "readium-desktop/renderer/assets/styles/components/buttons.css";
import * as stylesGlobal from "readium-desktop/renderer/assets/styles/global.css";
import { useTranslator } from "readium-desktop/renderer/common/hooks/useTranslator";

// Logger
const debug = debug_("readium-desktop:renderer:publicationInfoDescription");
debug("_");

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {
    publicationViewMaybeOpds: TPublication;
}

const PublicationInfoDescription: React.FC<IProps> = (props) => {
    const {publicationViewMaybeOpds: { description }} = props;

    const [seeMore, setSeeMore] = React.useState(false);
    const [needSeeMore, setNeedSeeMore] = React.useState(false);

    const descriptionWrapperRef = React.useRef<HTMLDivElement>();
    const descriptionRef = React.useRef<HTMLParagraphElement>();

    const [__] = useTranslator();

    const needSeeMoreButton = () => {
        if (!descriptionWrapperRef?.current || !descriptionRef?.current) {
            return;
        }
        const need = descriptionWrapperRef.current.offsetHeight < descriptionRef.current.offsetHeight;
        setNeedSeeMore(need);
    };

    const toggleSeeMore = () => setSeeMore(!seeMore);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            needSeeMoreButton();
        }, 500);
        return () => 
            clearTimeout(timeout);
        });

    if (!description) return <></>;
    const textSanitize = DOMPurify.sanitize(description).replace(/font-size:/g, "font-sizexx:");
    if (!textSanitize) return <></>;

    return (
        <>
        <div className={stylesGlobal.heading}>
            <h3>{__("catalog.description")}</h3>
        </div>
        <div className={classNames(stylesBlocks.block_line, stylesBlocks.description_see_more)}>
            <div
                ref={descriptionWrapperRef}
                className={classNames(
                    stylesBookDetailsDialog.descriptionWrapper,
                    needSeeMore && stylesGlobal.mb_30,
                    needSeeMore && stylesBookDetailsDialog.hideEnd,
                    seeMore && stylesBookDetailsDialog.seeMore,
                )}
            >
                <div
                    ref={descriptionRef}
                    className={stylesBookDetailsDialog.allowUserSelect}
                    dangerouslySetInnerHTML={{ __html: textSanitize }}
                >
                </div>
            </div>
            {
                needSeeMore &&
                <button aria-hidden className={stylesButtons.button_see_more} onClick={toggleSeeMore}>
                    {
                        seeMore
                            ? __("publication.seeLess")
                            : __("publication.seeMore")
                    }
                </button>
            }
        </div>
    </>
    )
    
}

export default PublicationInfoDescription;
