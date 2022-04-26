import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, forwardRef } from "@angular/core";
import {
    ControlValueAccessor,
    FormBuilder,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { ListView } from "@batch-flask/core";
import { LoadingStatus } from "@batch-flask/ui";
import { Offer, Pool, PoolOsSkus } from "app/models";
import { PoolListParams, PoolOsService, PoolService, VmSizeService } from "app/services";
import { PoolUtils } from "app/utils";
import { List } from "immutable";
import { Subject, Subscription, combineLatest } from "rxjs";
import { distinctUntilChanged, startWith, takeUntil } from "rxjs/operators";

import "./pool-picker.scss";

interface PoolFilters {
    id: string;
    offer: string;
    hideAutoUpdate: boolean;
}

const CLOUD_SERVICE_OFFER = "cloudservice-windows";

@Component({
    selector: "bl-pool-picker",
    templateUrl: "pool-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PoolPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => PoolPickerComponent), multi: true },
    ],
})
export class PoolPickerComponent implements ControlValueAccessor, OnDestroy {
    public LoadingStatus = LoadingStatus;

    public pickedPool: string;
    public poolsData: ListView<Pool, PoolListParams>;
    public displayedPools: List<Pool> = List([]);
    public filters: FormGroup<PoolFilters>;
    public offers: any[] = [];

    private _vmSizeCoresMap = new Map<string, number>();
    private _pools: List<Pool> = List([]);
    private _offers: Offer[] = [];
    private _propagateChange: (value: any) => void = null;
    private _destroy = new Subject();

    constructor(
        formBuilder: FormBuilder,
        private poolService: PoolService,
        private poolOsService: PoolOsService,
        private vmSizeService: VmSizeService,
        private changeDetector: ChangeDetectorRef) {
        this.poolsData = this.poolService.listView;
        this.filters = formBuilder.group({
            id: "",
            offer: null,
            hideAutoPool: [true],
        });

        this.poolOsService.offers.subscribe((offers: PoolOsSkus) => {
            this._offers = offers.allOffers;
            this._updateOffers();
        });

        combineLatest(
            this.poolsData.items,
            this.filters.valueChanges.pipe(startWith(this.filters.value), distinctUntilChanged()),
        ).pipe(
            takeUntil(this._destroy),
        ).subscribe(([pools, filters]) => {
            this._updateDisplayedPools(pools, filters);
        });
        this.poolsData.items.subscribe((pools) => {
            this._pools = pools;
            this._updateOffers();
        });

        this.vmSizeService.sizes.pipe(takeUntil(this._destroy)).subscribe((sizes) => {
            if (!sizes) { return; }
            const vmSizeCoresMap = new Map<string, number>();
            sizes.forEach((size) => {
                vmSizeCoresMap.set(size.id, size.numberOfCores);
            });

            this._vmSizeCoresMap = vmSizeCoresMap;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public writeValue(poolInfo: any) {
        this.pickedPool = poolInfo && poolInfo.poolId;
        this.changeDetector.markForCheck();
    }

    public validate() {
        return null;
    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public pickPool(pool: Pool) {
        this.pickedPool = pool.id;
        if (this._propagateChange) {
            this._propagateChange({ poolId: pool.id });
        }
    }

    public iconForPool(pool: Pool) {
        return PoolUtils.iconForPool(pool);
    }

    public poolCoreCount(pool: Pool) {
        const cores = this._vmSizeCoresMap.get(pool.vmSize) || 1;
        return cores * pool.targetNodes;
    }

    public trackPool(index, pool: Pool) {
        return pool.id;
    }

    public trackOffer(_, offer: Offer) {
        return offer.name;
    }

    public resetFilters() {
        this.filters.setValue({
            id: "",
            offer: null,
        });
    }

    private _updateDisplayedPools(pools: List<Pool>, filters: PoolFilters) {
        this.displayedPools = List(pools.filter((pool) => {
            return this._filterPool(pool, filters);
        }));
        this.changeDetector.markForCheck();
    }

    private _filterPool(pool: Pool, filters: PoolFilters): boolean {
        if (filters.id !== "" && !pool.id.toLowerCase().contains(filters.id.toLowerCase())) {
            return false;
        }

        // if (filters.hideAutoUpdate) {
        //     return false;
        // }

        if (filters.offer) {
            if (!this._filterByOffer(pool, filters.offer)) {
                return false;
            }
        }
        return true;
    }

    private _filterByOffer(pool: Pool, offer: string) {
        const filterByPaaS = offer === CLOUD_SERVICE_OFFER;
        const isIaaS = PoolUtils.isIaas(pool);
        if (isIaaS) {
            if (filterByPaaS) { return false; }
            if (pool.virtualMachineConfiguration.imageReference.offer !== offer) { return false; }
        } else {
            if (!filterByPaaS) { return false; }
        }
        return true;
    }

    private _updateOffers() {
        const offers = this._offers.map((offer) => {
            const count = this._pools.count(x => this._filterByOffer(x, offer.name));
            return {
                name: offer.name,
                label: `${offer.name} (${count})`,
            };
        });

        const cloudServiceCount = this._pools.count(x => this._filterByOffer(x, CLOUD_SERVICE_OFFER));
        offers.push({
            name: CLOUD_SERVICE_OFFER,
            label: `Windows (Cloud service) (${cloudServiceCount})`,
        });

        this.offers = offers;
        this.changeDetector.markForCheck();
    }
}
