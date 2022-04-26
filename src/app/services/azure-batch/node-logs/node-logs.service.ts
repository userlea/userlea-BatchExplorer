import { Injectable } from "@angular/core";
import { DateTime } from "luxon";
import { Observable, of } from "rxjs";
import { catchError, map, share } from "rxjs/operators";
import { FileService } from "../file";

export const NODE_LOGS_SEPARATOR = "■";
export const NODE_LOGS_NEWLINE = /□/g;
export const NODE_LOGS_FILE_DEBUG = "startup/_nodelogs/agent-debug.log";
export const NODE_LOGS_FILE_WARN = "startup/_nodelogs/agent-warn.log";
export const NODE_LOGS_TIMESTAMP_FORMAT = "yyyyLLddThhmmss.SSS'Z'";

@Injectable({ providedIn: "root" })
export class NodeLogsService {

    constructor(private fileService: FileService) {

    }

    public loadLogs(poolId: string, nodeId: string): Observable<NodeLogEntry[]> {
        return this._loadLogFiles(poolId, nodeId).pipe(
            map(x => this._processLogFile(x)),
            share(),
        );
    }

    private _loadLogFiles(poolId: string, nodeId: string) {
        return this._loadLogFile(poolId, nodeId, NODE_LOGS_FILE_DEBUG);
    }

    private _loadLogFile(poolId: string, nodeId: string, path: string) {
        return this.fileService.getComputeNodeFile(poolId, nodeId, path).pipe(
            map(x => x.content),
            catchError(() => {
                return of(null);
            }),
        );
    }

    private _processLogFile(rawLog: string): NodeLogEntry[] {
        if (!rawLog) { return []; }
        const lineStart = `${NODE_LOGS_SEPARATOR}${NODE_LOGS_SEPARATOR}`;
        if (rawLog.startsWith(lineStart)) {
            rawLog = rawLog.slice(2);
        }
        const entries = rawLog.split(`\n${lineStart}`);

        return entries.map((entry) => {
            const cells = entry.split(NODE_LOGS_SEPARATOR);
            return this._buildLogEntry(cells);
        });
    }

    private _buildLogEntry(cells: string[]): NodeLogEntry {
        return {
            timestamp: DateTime.fromString(cells[0], NODE_LOGS_TIMESTAMP_FORMAT).toJSDate(),
            id: cells[1],
            level: cells[2] && cells[2].toLowerCase() as NodeLogLevel,
            message: cells[10].replace(NODE_LOGS_NEWLINE, "\n"),

        };
    }
}

export interface NodeLogEntry {
    timestamp: Date;
    id: string;
    level: NodeLogLevel;
    message: string;
}

export enum NodeLogLevel {
    Info = "info",
    Warning = "warning",
    Error = "error",
    Critical = "critical",
    Debug = "debug",
}
