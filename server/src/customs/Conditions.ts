export class Conditions {
    public static hasAny(arg: unknown[]): boolean {
        if (!arg || arg[0] == null || arg[0] == undefined) {
            return false;
        }
        return true;
    }
}