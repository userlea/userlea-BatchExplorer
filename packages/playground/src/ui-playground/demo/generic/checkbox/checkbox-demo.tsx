//import { useAppTheme } from "@batch/ui-react/lib/theme";
import * as React from "react";
import { DemoPane } from "../../../layout/demo-pane";
import { Checkbox } from "@fluentui/react/lib/";
import { TextField } from "@fluentui/react/lib/TextField";
import {
    ChoiceGroup,
    IChoiceGroupOption,
} from "@fluentui/react/lib/ChoiceGroup";
import { Link } from "@fluentui/react/lib/Link";

import { TextFieldOnChange, ChoiceGroupOnChange } from "../../../functions";
export const CheckboxDemo: React.FC = (props) => {
    //return <h1 style={headingStyle}>Checkbox</h1>;

    const [isChecked, setIsChecked] = React.useState(false);
    const onChange = React.useCallback(
        (
            ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
            checked?: boolean
        ): void => {
            setIsChecked(!!checked);
        },
        []
    );

    //const [labelValue, setLabelValue] = React.useState("Sample text");

    const [disabledKey, setDisabledKey] = React.useState<string | undefined>(
        "nondisabled"
    );

    const disabledOptions: IChoiceGroupOption[] = [
        { key: "nondisabled", text: "nondisabled" },
        { key: "disabled", text: "disabled" },
    ];

    const [boxEndKey, setBoxEndKey] = React.useState<
        "start" | "end" | undefined
    >("start");

    const boxEndOptions: IChoiceGroupOption[] = [
        { key: "start", text: "start" },
        { key: "end", text: "end" },
    ];

    function ModifiedChoiceGroupOnChange(
        param: React.Dispatch<React.SetStateAction<"start" | "end" | undefined>>
    ): (
        ev?: React.FormEvent<HTMLInputElement | HTMLElement> | undefined,
        option?: IChoiceGroupOption | undefined
    ) => void {
        // ...
        const Hello = React.useCallback(
            (
                ev?: React.FormEvent<HTMLInputElement | HTMLElement>,
                option?: IChoiceGroupOption
            ) => {
                if (option?.key == "end") {
                    param("end");
                } else {
                    param("start");
                }
            },
            []
        );

        return Hello;
    }

    const [indeterminateKey, setIndeterminateKey] = React.useState<
        string | undefined
    >("false");

    const indeterminateOptions: IChoiceGroupOption[] = [
        { key: "false", text: "false" },
        { key: "true", text: "true" },
    ];

    const [alignKey, setAlignKey] = React.useState<string | undefined>(
        "center"
    );

    const alignOptions: IChoiceGroupOption[] = [
        { key: "flex-start", text: "Left" },
        { key: "center", text: "Middle" },
        { key: "flex-end", text: "Right" },
    ];

    const [secondValue, setSecondValue] = React.useState("Link to the");

    const [placeholderValue, setPlaceholderValue] = React.useState(
        "Microsoft home page"
    );

    const [urlValue, setUrlValue] = React.useState("https://www.microsoft.com");

    const [errorMsg, setErrorMsg] = React.useState("");

    const onChangeSecondTextFieldValue = React.useCallback(
        (
            event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string
        ) => {
            let count = 0;
            const ch = ".";

            let i = 0;
            if (!newValue) {
                //dummy++;
            } else {
                i = newValue.length - 1;
            }

            while (i >= 0) {
                if (newValue?.charAt(i) == ch) {
                    count++;
                }
                i--;
            }

            if (
                (!newValue ||
                    newValue[0] != "h" ||
                    newValue[1] != "t" ||
                    newValue[2] != "t" ||
                    newValue[3] != "p" ||
                    !newValue.includes(".") ||
                    (newValue.indexOf(":") != 4 &&
                        newValue.indexOf(":") != 5) ||
                    (newValue[4] != "s" && newValue[4] != ":") ||
                    count < 2 ||
                    newValue.lastIndexOf(".") == newValue.length - 1) &&
                (!newValue || newValue[0] != "/")
            ) {
                setErrorMsg("Error: Invalid URL (must begin with HTTP or /)");
                setUrlValue(newValue || "");
            } else {
                setErrorMsg("");
                setUrlValue(newValue);
            }
        },
        []
    );

    const [textUrlOrderKey, setTextUrlOrderKey] = React.useState<
        string | undefined
    >("textfirst");

    const textUrlOrderOptions: IChoiceGroupOption[] = [
        { key: "textfirst", text: "Text First" },
        { key: "urlfirst", text: "URL First" },
    ];

    function _renderLabelWithLink() {
        if (textUrlOrderKey == "textfirst") {
            return (
                <span>
                    {secondValue}{" "}
                    <Link href={urlValue} target="_blank" underline>
                        {placeholderValue}
                    </Link>
                </span>
            );
        } else {
            return (
                <span>
                    <Link href={urlValue} target="_blank" underline>
                        {placeholderValue}
                    </Link>{" "}
                    {secondValue}
                </span>
            );
        }
    }

    return (
        <DemoPane title="Checkbox">
            <div style={{ display: "flex", justifyContent: alignKey }}>
                <Checkbox
                    //label={labelValue}
                    checked={isChecked}
                    onChange={onChange}
                    disabled={disabledKey == "disabled"}
                    //defaultIndeterminate
                    boxSide={boxEndKey}
                    indeterminate={indeterminateKey == "true"}
                    onRenderLabel={_renderLabelWithLink}
                />
            </div>
            {/* <TextField
                label="Text"
                defaultValue={labelValue}
                onChange={TextFieldOnChange(setLabelValue)}
            /> */}
            <TextField
                label="Text"
                defaultValue={secondValue}
                onChange={TextFieldOnChange(setSecondValue)}
            />
            <TextField
                label="URL Placeholder"
                defaultValue={placeholderValue}
                onChange={TextFieldOnChange(setPlaceholderValue)}
            />
            <TextField
                label="Actual URL"
                defaultValue={urlValue}
                onChange={onChangeSecondTextFieldValue}
                errorMessage={errorMsg}
            />
            <ChoiceGroup
                selectedKey={textUrlOrderKey}
                options={textUrlOrderOptions}
                onChange={ChoiceGroupOnChange(setTextUrlOrderKey)}
                label="Text first or second?"
            />
            <ChoiceGroup
                selectedKey={disabledKey}
                options={disabledOptions}
                onChange={ChoiceGroupOnChange(setDisabledKey)}
                label="Disabled status"
            />
            <ChoiceGroup
                selectedKey={boxEndKey}
                options={boxEndOptions}
                onChange={ModifiedChoiceGroupOnChange(setBoxEndKey)}
                label="Box end status"
            />
            <ChoiceGroup
                selectedKey={indeterminateKey}
                options={indeterminateOptions}
                onChange={ChoiceGroupOnChange(setIndeterminateKey)}
                label="Indeterminate status"
            />
            <ChoiceGroup
                selectedKey={alignKey}
                options={alignOptions}
                onChange={ChoiceGroupOnChange(setAlignKey)}
                label="Alignment"
            />
        </DemoPane>
    );
};
