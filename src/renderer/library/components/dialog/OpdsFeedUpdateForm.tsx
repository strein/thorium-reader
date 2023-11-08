// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as React from "react";
import { connect } from "react-redux";
import { DialogType, DialogTypeName } from "readium-desktop/common/models/dialog";
import * as stylesGlobal from "readium-desktop/renderer/assets/styles/global.css";
import * as stylesInputs from "readium-desktop/renderer/assets/styles/components/inputs.css";
import * as stylesModals from "readium-desktop/renderer/assets/styles/components/modals.css";
import Dialog from "readium-desktop/renderer/common/components/dialog/Dialog";
import {
    TranslatorProps, withTranslator,
} from "readium-desktop/renderer/common/components/hoc/translator";
import { apiAction } from "readium-desktop/renderer/library/apiAction";
import { ILibraryRootState } from "readium-desktop/common/redux/states/renderer/libraryRootState";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IBaseProps extends TranslatorProps {
}
// IProps may typically extend:
// RouteComponentProps
// ReturnType<typeof mapStateToProps>
// ReturnType<typeof mapDispatchToProps>
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps extends IBaseProps, ReturnType<typeof mapStateToProps> {
}

interface IState {
    name: string | undefined;
    url: string | undefined;
}

class OpdsFeedUpdateForm extends React.Component<IProps, IState> {
    private focusRef: React.RefObject<HTMLInputElement>;

    constructor(props: IProps) {
        super(props);

        this.focusRef = React.createRef<HTMLInputElement>();

        this.state = {
            name: props.feed?.title,
            url: props.feed?.url,
        };
    }

    public componentDidMount() {
        if (this.focusRef?.current) {
            this.focusRef.current.focus();
        }
    }

    public render(): React.ReactElement<{}> {
        if (!this.props.open) {
            return (<></>);
        }

        const { __ } = this.props;
        const { name, url } = this.state;
        return (
            <Dialog
                id={stylesModals.opds_form_dialog}
                title={__("opds.updateForm.title")}
                onSubmitButton={this.update}
                submitButtonDisabled={!(name && url)}
                submitButtonTitle={__("opds.updateForm.updateButton")}
                shouldOkRefEnabled={false}
            >
                <div className={stylesGlobal.w_50}>
                    <div className={stylesInputs.form_group}>
                        <label>{__("opds.updateForm.name")}</label>
                        <input
                            onChange={(e) => this.setState({
                                name: e.target.value,
                                // url: this.state.url || this.props.feed.url,
                            })}
                            type="text"
                            aria-label={__("opds.updateForm.name")}
                            defaultValue={this.props.feed.title}
                            ref={this.focusRef}
                        />
                    </div>
                    <div className={stylesInputs.form_group}>
                        <label>{__("opds.updateForm.url")}</label>
                        <input
                            onChange={(e) => this.setState({
                                // name: this.state.name || this.props.feed.title,
                                url: e.target.value,
                            })}
                            type="text"
                            aria-label={__("opds.updateForm.url")}
                            defaultValue={this.props.feed.url}
                        />
                    </div>
                    <div>
                        <button className="button_primary" onClick={() => this.authorize()}
                            type="button"
                        >Authorize!</button>
                    </div>

                </div>
            </Dialog>
        );
    }

    private authorize = () => {
        const url: string = this.props.feed.url;

        apiAction("opds/authorizeFeed", url).catch((err) => {
            console.error("Error to fetch api opds/authorizeFeed", err);
        });
    };

    private update = () => {
        const title = this.state.name;
        const url = this.state.url;
        if (!title || !url) {
            return;
        }
        apiAction("opds/deleteFeed", this.props.feed.identifier).then(() => {
            apiAction("opds/addFeed", { title, url }).catch((err) => {
                console.error("Error to fetch api opds/addFeed", err);
            });
        }).catch((err) => {
            console.error("Error to fetch api opds/deleteFeed", err);
        });
    };

}

const mapStateToProps = (state: ILibraryRootState, _props: IBaseProps) => ({
    open: state.dialog.type === DialogTypeName.OpdsFeedUpdateForm,
    feed: (state.dialog.data as DialogType[DialogTypeName.DeleteOpdsFeedConfirm]).feed,
});

export default connect(mapStateToProps)(withTranslator(OpdsFeedUpdateForm));
