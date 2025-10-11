export function ColumnName(columnName: string) {
    return function (target: unknown, propertyKey: string): void {
        // Ensure columnMappings exists on the prototype, not shared across all classes
        if (!Object.prototype.hasOwnProperty.call(target, "columnMappings")) {
            Object.defineProperty(target, "columnMappings", {
                value: {},
                writable: true,
                enumerable: false,
                configurable: true,
            });
        }

        (target as IColumnMapped).columnMappings[propertyKey] = columnName;
    };
}

interface IColumnMapped {
    columnMappings: Record<string, string>;
}