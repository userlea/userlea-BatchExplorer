import { Injectable } from "@angular/core";
import { Observable, Subscription, forkJoin, of } from "rxjs";

let idCounter = 0;

@Injectable({ providedIn: "root" })
export class PageRefreshService {

    private _registered = new Map<number, () => Observable<any>>();

    public refresh(): Observable<any> {
        if (this._registered.size === 0) {
            return of(null);
        }
        return forkJoin(
            [...this._registered.values()].map(x => x()),
        );
    }

    public register(refreshFn: () => Observable<any>): Subscription {
        const id = idCounter++;
        this._registered[id] = refreshFn;

        return new Subscription(() => this._unregister(id));
    }

    private _unregister(id: number) {
        this._registered.delete(id);
    }
}
