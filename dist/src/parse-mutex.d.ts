import { Db } from 'mongodb';
export default class ParseMutex {
    connection: Promise<Db>;
    private databaseURI;
    private dbName;
    constructor(databaseURI: string, dbName: string);
    lock(key: string, callback: () => void): void;
    execute(callback: (db: Db) => void): void;
    private connect;
    private setupCollection;
}
