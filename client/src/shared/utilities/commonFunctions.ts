export class CommonFunctions {
    public static toCamelCase(text: string): string {
        return text.charAt(0).toLowerCase() + text.slice(1);
    }
}