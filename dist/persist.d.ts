export declare enum PersistMode {
    "persist-for" = 0,
    "persist-until" = 1,
    "forget-between-versions" = 2,
    "forget-before-date" = 3
}
export interface PersistOptions {
    verbose: boolean;
    cleanup: boolean;
    hide: boolean;
    purge: boolean;
    showPersistManager: boolean;
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
    "file" = 11,
    "text" = 12,
    "range" = 13,
    "datetime-local" = 14,
    "month" = 15,
    "password" = 16,
    "search" = 17,
    "tel" = 18,
    "time" = 19,
    "week" = 20
}
export declare function persistField(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, options: PersistOptions): void;
export declare function persist(options?: PersistOptions): void;
declare const VERSION = "1.0.0";
export { VERSION };
export declare function togglePersistmanager(): void;
