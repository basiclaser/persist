export declare enum PersistMode {
    "persist-for" = 0,
    "persist-until" = 1,
    "forget-between-versions" = 2
}
export interface PersistOptions {
    namespace: string;
    verbose: boolean;
    cleanup: boolean;
    purge: boolean;
    showPersistManager: boolean;
    version: string;
    highlight: boolean;
}
export declare enum PersistSupportedFieldType {
    "number" = 0,
    "date" = 1,
    "color" = 2,
    "url" = 3,
    "email" = 4,
    "phone" = 5,
    "textarea" = 6,
    "select" = 7,
    "select[multiple]" = 8,
    "checkbox" = 9,
    "radio" = 10,
    "text" = 11,
    "range" = 12,
    "datetime-local" = 13,
    "month" = 14,
    "password" = 15,
    "search" = 16,
    "tel" = 17,
    "time" = 18,
    "week" = 19
}
export declare function persistField(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, options: PersistOptions): void;
export declare function persist(options?: PersistOptions): void;
declare const PERSIST_VERSION = "1.0.0";
export { PERSIST_VERSION };
export declare function showPersistManager({ verbose }: PersistOptions): void;
