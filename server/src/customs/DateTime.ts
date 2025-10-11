export class DateTime {

    /**
     * Current time as per ISO standard
     * @returns Current ISO Time in string format
     */
    public static CurrentISOTime(): string {
        return new Date().toISOString();
    }

    /**
     * Get Timestamp in YYYYMMDDHHmmss format
     * @returns Timestamp in YYYYMMDDHHmmss format
     */
    public static GetCurrentTimestamp(): string {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }
}