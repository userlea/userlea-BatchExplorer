import { Constants } from "client/client-constants";
import { BatchExplorerApplication } from "client/core/batch-explorer-application";
import { ClosedWindowError, UniqueWindow } from "client/core/unique-window";
import { Deferred } from "common";
import { BrowserWindow, ipcMain, nativeImage } from "electron";

const urls = Constants.urls.tenantSelection;
const url = process.env.HOT ? urls.dev : urls.prod;

export class TenantSelectionWindow extends UniqueWindow {
    public chosenTenantIds: Promise<string[] | null>;
    private _deferred: Deferred<string[] | null>;

    constructor(batchExplorerApplication: BatchExplorerApplication) {
        super(batchExplorerApplication);
        this._deferred = new Deferred();
        this.chosenTenantIds = this._deferred.promise;
    }

    public createWindow() {
        const window = new BrowserWindow({
            title: `BatchExplorer: Chose Azure Active Directory Tenant`,
            titleBarStyle: "hidden",
            resizable: false,
            width: 340,
            height: 340,
            icon: nativeImage.createFromDataURL(Constants.urls.icon),
            show: false,
            center: true,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
            },
        });

        window.loadURL(url);
        window.once("ready-to-show", () => {
            this.show();
        });
        this._setupEvents(window);

        return window;
    }

    private _setupEvents(window: BrowserWindow) {
        ipcMain.once("tenant-selection-submitted", (_, chosenTenantIds: string[] | null) => {
            this.hide();
            this._deferred.resolve(chosenTenantIds);
            this.close();
        });
        window.on("close", () => {
            if (!this._deferred.hasCompleted) {
                this._deferred.reject(new ClosedWindowError("AAD tenant selection window was closed"));
            }
        });
    }

}
