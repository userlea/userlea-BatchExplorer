import { Injectable } from "@angular/core";
import {
    Pipeline,
    ServiceURL,
    StorageURL,
    TokenCredential,
} from "@azure/storage-blob";
import { ServerError } from "@batch-flask/core";
import { SanitizedError } from "@batch-flask/utils";
import { ArmBatchAccount, StorageKeys } from "app/models";
import { BatchExplorerService } from "app/services/batch-explorer.service";
import { ArmResourceUtils } from "app/utils";
import { Observable, throwError } from "rxjs";
import { first, flatMap, map, share, switchMap, take } from "rxjs/operators";
import { AdalService } from "../adal";
import { BatchAccountService } from "../batch-account";
import { BlobStorageClientProxy } from "./blob-storage-client-proxy";
import { StorageAccountKeysService } from "./storage-account-keys.service";
import { StorageClientProxyFactory } from "./storage-client-proxy-factory";

export interface AutoStorageSettings {
    lastKeySync: Date;
    storageAccountId: string;
}

export interface StorageKeyCachedItem {
    batchAccountId: string;
    storageAccountName: string;
    settings: AutoStorageSettings;
    keys: StorageKeys;
}

@Injectable({ providedIn: "root" })
export class StorageClientService {
    public hasAutoStorage: Observable<boolean>;
    public hasArmAutoStorage: Observable<boolean>;

    private _storageClientFactory: StorageClientProxyFactory;
    private _sharedKeyMap = new Map<string, any>();
    private _tokenCredential: TokenCredential;
    private _pipeline: Pipeline;
    private _serviceURL: ServiceURL;

    constructor(
        private batchExplorer: BatchExplorerService,
        private accountService: BatchAccountService,
        private adal: AdalService,
        private storageKeysService: StorageAccountKeysService) {

        this._storageClientFactory = new StorageClientProxyFactory();

        this.hasAutoStorage = this.accountService.currentAccount.pipe(map((account) => {
            return Boolean(account.autoStorage);
        }));

        this.hasArmAutoStorage = this.accountService.currentAccount.pipe(map((account) => {
            return account.hasArmAutoStorage();
        }));
    }

    public get(storageAccountId: string): Observable<ServiceURL> {
        return this.accountService.currentAccount.pipe(
            take(1),
            switchMap((account): Observable<ServiceURL> => {
                if (account instanceof ArmBatchAccount) {
                    return this.adal.accessTokenData(account.subscription.tenantId, "storage").pipe(
                        map((accessToken) => {
                            if (this._serviceURL) {
                                this._tokenCredential.token = accessToken.access_token;
                            } else {
                                this._tokenCredential = new TokenCredential(accessToken.access_token);
                                this._pipeline = StorageURL.newPipeline(this._tokenCredential);
                                this._serviceURL = new ServiceURL(
                                    this._getAccountUrl(storageAccountId), this._pipeline);
                            }
                            return this._serviceURL as ServiceURL;
                        }),
                    );
                } else {
                    return throwError(new SanitizedError("Can't use storage API with local batch account"));
                }
            }),
        );
    }

    public getAutoStorage(): Observable<any> {
        return this.accountService.currentAccount.pipe(
            first(),
            flatMap((account) => {
                const settings = account.autoStorage;
                if (!settings) {
                    return throwError(new ServerError({
                        status: 404,
                        code: "AutostorageNotSetup",
                        message: "Autostorage not setup for this account",
                    }));
                }
                return this.getFor(settings.storageAccountId);
            }),
            share(),
        );
    }

    public getFor(storageAccountId: string): Observable<BlobStorageClientProxy> {
        return this.storageKeysService.getFor(storageAccountId).pipe(map((keys) => {
            return this._storageClientFactory.getBlobServiceForSharedKey({
                account: ArmResourceUtils.getAccountNameFromResourceId(storageAccountId),
                key: keys.primaryKey,
                endpoint: this.batchExplorer.azureEnvironment.storageEndpoint,
            });
        }));
    }

    public clearCurrentStorageKeys() {
        this._sharedKeyMap.clear();
    }

    private _getAccountUrl(storageAccountId) {
        const name = ArmResourceUtils.getAccountNameFromResourceId(storageAccountId);
        const endpoint = this.batchExplorer.azureEnvironment.storageEndpoint;
        return `https://${name}.blob.${endpoint}`;
    }
}
