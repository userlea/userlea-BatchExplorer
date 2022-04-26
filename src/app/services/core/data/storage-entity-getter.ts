import { Type } from "@angular/core";
import { ServiceURL } from "@azure/storage-blob";
import { EntityGetter, EntityGetterConfig, Record, ServerError } from "@batch-flask/core";
import { StorageClientService } from "app/services/storage/storage-client.service";
import { Observable, from, throwError } from "rxjs";
import { catchError, flatMap, share } from "rxjs/operators";
import { StorageBaseParams } from "./storage-list-getter";

export interface StorageEntityGetterConfig<TEntity extends Record<any>, TParams extends StorageBaseParams>
    extends EntityGetterConfig<TEntity, TParams> {

    /**
     * Get function(usually call the client proxy)
     */
    getFn: (client: ServiceURL, params: TParams) => Promise<any>;
}

export class StorageEntityGetter<TEntity extends Record<any>, TParams extends StorageBaseParams>
    extends EntityGetter<TEntity, TParams> {

    private _getMethod: (client: any, params: TParams) => Promise<any>;

    constructor(
        type: Type<TEntity>,
        private storageClient: StorageClientService,
        config: StorageEntityGetterConfig<TEntity, TParams>) {

        super(type, config);
        this._getMethod = config.getFn;
    }

    protected getData(params: TParams): Observable<any> {
        return this.storageClient.get(params.storageAccountId).pipe(
            flatMap((client) => {
                return from(this._getMethod(client, params));
            }),
            catchError((error) => {
                return throwError(ServerError.fromStorage(error));
            }),
            share(),
        );
    }
}
