import { MongoClient, Db, Collection } from 'mongodb';

const namespace = '_ParseMutex';

export default class ParseMutex {
  public connection: Promise<Db>;
  private databaseURI: string;
  private dbName: string;

  constructor(databaseURI: string, dbName: string) {
    this.databaseURI = databaseURI;
    this.dbName = dbName;

    this.connection = this.connect();
    this.setupCollection();
  }

  public lock(key: string, callback: () => void) {
    this.execute((db) => {
      db.collection(namespace, { strict: true }, (error, collection) => {
        if (error) { throw error; }

        collection.insertOne({ key })
          .then(() => {
            try {
              callback();
            } finally {
              this.unlock(collection, key);
            }
          })
          .catch(() => {});
      });
    });
  }

  public unlock(collection: Collection, key: string) {
    setTimeout(() => {
      collection.deleteOne({ key });
    }, 1000);
  }

  public execute(callback: (db: Db) => void) {
    this.connection
      .then((db) => callback(db))
      .catch((reason) => { throw new Error(reason); });
  }

  private connect() {
    const client = new MongoClient(this.databaseURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    return new Promise<Db>((resolve, reject) => {
      client.connect()
        .then((clientHandler) => {
          resolve(clientHandler.db(this.dbName));
        })
        .catch((reason) => {
          reject(reason);
        });
    });
  }

  private setupCollection() {
    this.execute((db) => {
      db.collection(namespace, { strict: true }, (error) => {
        if (error) {
          db.createCollection(namespace)
            .then(() => db.createIndex(namespace, 'key', { unique: true }))
            .catch((reason) => { throw new Error(reason); });
        }
      });
    });
  }
}
