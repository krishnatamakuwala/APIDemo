export class DataNotFoundError extends Error {
    constructor(msg: string) {
        super(msg);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, DataNotFoundError.prototype);
    }
}