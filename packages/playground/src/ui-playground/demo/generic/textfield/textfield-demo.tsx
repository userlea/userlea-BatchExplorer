import * as React from "react";
import { DemoPane } from "../../../layout/demo-pane";
import { TextField } from "@fluentui/react/lib/TextField";
import {
    ChoiceGroup,
    IChoiceGroupOption,
} from "@fluentui/react/lib/ChoiceGroup";
import { ChoiceGroupOnChange } from "../../../functions";
import { Toggle } from "@fluentui/react/lib/index";
import { MonacoEditor } from "@batch/ui-react/lib/components";
import { HeightAndWidth } from "../../../functions";

export const TextFieldDemo: React.FC = () => {
    const [disabledKey, setDisabledKey] = React.useState<string | undefined>(
        "nondisabled"
    );

    const disabledOptions: IChoiceGroupOption[] = [
        { key: "nondisabled", text: "nondisabled" },
        { key: "disabled", text: "disabled" },
    ];

    const [required, setRequired] = React.useState(false);

    const onRequiredChange = React.useCallback(
        (ev, checked?: boolean) => setRequired(!!checked),
        []
    );

    const [mane, setMane] = React.useState<boolean | undefined>(true);

    //let mane = false;

    //const ultimate = "true";

    const msg2 = `{\n"disabled": true\n}`;

    //const mibble = "";

    /* function monacoOnChange(
        param: string
    ): ((value: string) => void) | undefined {
        return undefined;
    }
    */

    /*  function Milk(param: string): (value: string) => void | undefined {
        const Hello = (value: string) => {
            //value.concat("HEY DUDES");
            //msg2 = msg2.concat("HI PEEPS");
            msg2 = msg2.concat(value);
            console.warn(value);
            if (value.includes("false")) {
                mane = false;
            }
        };
        return Hello;
    } */

    function Meep(): (value: string) => void | undefined {
        const Hello = (value: string) => {
            console.warn(value);
            if (value.includes("false")) {
                setMane(false);
                console.warn("worked");
            } else if (value.includes("true")) {
                setMane(true);
            }
            //console.log("test");
        };
        return Hello;
    }

    /* const handleInputChange = (
        e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
        newValue?: string
    ) => {
        setValue((e.target as HTMLTextAreaElement).value);
    }; */

    /* const _onChange = React.useCallback(
        (
            ev?: React.FormEvent<HTMLInputElement | HTMLElement>,
            option?: IChoiceGroupOption
        ) => {
            setSelectedKey(option?.key);
        },
        []
    ); */

    /*
    export function TextFieldOnChange(
    param: React.Dispatch<React.SetStateAction<string>>
): (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string | undefined
) => void {
    // ...
    const Hello = (
        e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
        newValue?: string
    ) => {
        param((e.target as HTMLTextAreaElement).value);
    };

    return Hello;
}
    */

    return (
        <DemoPane title="Textfield">
            <div style={{ display: "flex" }}>
                <TextField
                    label="Textfield"
                    value="This is a text field"
                    // onChange={() => {}}
                    disabled={mane}
                    required={required}
                />
            </div>
            <ChoiceGroup
                selectedKey={disabledKey}
                options={disabledOptions}
                onChange={ChoiceGroupOnChange(setDisabledKey)}
                label="Disabled status"
            />

            <Toggle
                label="Required? True or False"
                onChange={onRequiredChange}
                checked={required}
            />
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: HeightAndWidth()[0] / 3, //500
                    whiteSpace: "pre",
                }}
            >
                <MonacoEditor
                    value={msg2}
                    onImmediateChange={Meep()}
                    language="json"
                    containerStyle={{
                        // display: "flex",
                        //flexDirection: "column",
                        //flexGrow: 1,
                        width: "80%",
                        height: "100%",
                        // justifyContent: "center",
                    }}
                    editorOptions={{
                        minimap: {
                            enabled: false,
                        },
                    }}
                />
            </div>
        </DemoPane>
    );
};
