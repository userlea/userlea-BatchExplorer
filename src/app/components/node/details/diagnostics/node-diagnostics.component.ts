import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges,
} from "@angular/core";
import { isNotNullOrUndefined } from "@batch-flask/core";
import { NodeLogEntry, NodeLogLevel, NodeLogsService } from "app/services/azure-batch";
import { BehaviorSubject, Subject, combineLatest } from "rxjs";
import { debounceTime, filter, map, startWith, switchMap, takeUntil } from "rxjs/operators";

import { FormBuilder, FormGroup } from "@angular/forms";
import "./node-diagnostics.scss";

export interface NodeDiagnosticsComponentInputs {
    poolId: string;
    nodeId: string;
}

interface NodeLogsFilters {
    search: string;
    levels: string[];
}

@Component({
    selector: "bl-node-diagnostics",
    templateUrl: "node-diagnostics.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeDiagnosticsComponent implements OnChanges, OnDestroy {
    public levels = Object.values(NodeLogLevel);
    @Input() public poolId: string;
    @Input() public nodeId: string;

    public logs: NodeLogEntry[];

    public filters: FormGroup<NodeLogsFilters>;

    private _destroy = new Subject();
    private _inputs = new BehaviorSubject<NodeDiagnosticsComponentInputs | null>(null);
    constructor(
        formBuilder: FormBuilder,
        private changeDetector: ChangeDetectorRef,
        private nodeLogsService: NodeLogsService) {

        this.filters = formBuilder.group({
            search: "",
            levels: [["info", "critical", "warning", "error"]],
        });

        const logs = this._inputs.pipe(
            filter(isNotNullOrUndefined),
            switchMap(() => this.nodeLogsService.loadLogs(this.poolId, this.nodeId)),
        );

        const filters = this.filters.valueChanges.pipe(debounceTime(400), startWith(this.filters.value));

        combineLatest(logs, filters).pipe(
            takeUntil(this._destroy),
            map(([logs, filters]) => this._filterLogs(logs, filters)),
        ).subscribe((logs) => {
            this.logs = logs;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.poolId || changes.nodeId) {
            this._inputs.next({
                poolId: this.poolId,
                nodeId: this.nodeId,
            });
        }
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public trackItem(index: number) {
        return index;
    }

    private _filterLogs(logs: NodeLogEntry[], filters: NodeLogsFilters): NodeLogEntry[] {
        console.log("Logs", logs.length, filters);
        const levels = new Set(filters.levels);
        return logs.filter((entry) => {
            const searchMatch = filters.search === "" || entry.message.includes(filters.search);
            const levelMatch = levels.size === 0 || levels.has(entry.level);
            return searchMatch && levelMatch;
        });
    }
}
