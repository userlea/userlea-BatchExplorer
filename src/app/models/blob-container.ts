import { Model, NavigableRecord, Prop, Record } from "@batch-flask/core";
import { Constants } from "common";
import { LeaseState, LeaseStatus } from "./container-lease";

export interface BlobContainerAttributes {
    id: string;
    name: string;
    publicAccessLevel: string;
}

export interface BlobContainerPropertiesAttributes {
    eTag: string;
    hasImmutabilityPolicy: false;
    hasLegalHold: false;
    lastModified: Date;
    leaseState: LeaseState;
    leaseStatus: LeaseStatus;
    metadata?: any;
}

/**
 * Class for displaying blob container information.
 */
@Model()
export class BlobContainerProperties extends Record<BlobContainerAttributes>  {
    @Prop() public eTag: string;
    @Prop() public metadata: string;
    @Prop() public hasImmutabilityPolicy: false;
    @Prop() public hasLegalHold: false;
    @Prop() public lastModified: Date;
    @Prop() public leaseState: LeaseState;
    @Prop() public leaseStatus: LeaseStatus;
}

/**
 * Class for displaying blob container information.
 */
@Model()
export class BlobContainer extends Record<BlobContainerAttributes> implements NavigableRecord {
    // container name
    @Prop() public id: string;

    // container name with the prefix removed
    @Prop() public name: string;

    @Prop() public properties: BlobContainerProperties;

    @Prop() public storageAccountId: string;

    constructor(data: BlobContainerAttributes) {
        super({ id: data.name, ...data });
    }

    public get routerLink(): string[] {
        if (this.isFileGroup) {
            return ["/data/file-groups/containers", this.id];
        } else {
            return ["/data", this.storageAccountId, "containers", this.id];

        }
    }

    public get isFileGroup() {
        return this.id && this.id.startsWith(Constants.ncjFileGroupPrefix);
    }

    public get uid() {
        return this.storageAccountId.toLowerCase() + "/" + this.id;
    }
}
