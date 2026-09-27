import { seedBrailleSymbols, seedLessons } from "../mocks/seedData";
import { ServiceError } from "../services/errors";

export const DB_NAME = "braille-trainer-db";
export const DB_VERSION = 1;

export const STORE = {
  symbols: "brailleSymbols",
  lessons: "lessons",
  sessions: "practiceSessions",
  answers: "answerRecords",
  mistakes: "mistakeEntries",
  meta: "meta"
} as const;

export type StoreName = (typeof STORE)[keyof typeof STORE];

let dbPromise: Promise<IDBDatabase> | null = null;

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new ServiceError("STORAGE_UNAVAILABLE"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE.symbols)) db.createObjectStore(STORE.symbols, { keyPath: "id" });
      if (!db.objectStoreNames.contains(STORE.lessons)) db.createObjectStore(STORE.lessons, { keyPath: "id" });
      if (!db.objectStoreNames.contains(STORE.sessions)) db.createObjectStore(STORE.sessions, { keyPath: "id" });
      if (!db.objectStoreNames.contains(STORE.answers)) db.createObjectStore(STORE.answers, { keyPath: "id" });
      if (!db.objectStoreNames.contains(STORE.mistakes)) db.createObjectStore(STORE.mistakes, { keyPath: "id" });
      if (!db.objectStoreNames.contains(STORE.meta)) db.createObjectStore(STORE.meta);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new ServiceError("STORAGE_UNAVAILABLE", request.error));
  });

export const getDatabase = async (): Promise<IDBDatabase> => {
  if (!dbPromise) dbPromise = openDatabase();
  return dbPromise;
};

const wrapRead = <T>(task: () => Promise<T>) =>
  task().catch((cause: unknown) => {
    throw cause instanceof ServiceError ? cause : new ServiceError("STORAGE_READ_FAILED", cause);
  });

const wrapWrite = <T>(task: () => Promise<T>) =>
  task().catch((cause: unknown) => {
    throw cause instanceof ServiceError ? cause : new ServiceError("STORAGE_WRITE_FAILED", cause);
  });

const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

export const dbGetAll = async <T>(store: StoreName): Promise<T[]> =>
  wrapRead(async () => {
    const db = await getDatabase();
    return requestToPromise<T[]>(db.transaction(store, "readonly").objectStore(store).getAll());
  });

export const dbGet = async <T>(store: StoreName, key: IDBValidKey): Promise<T | undefined> =>
  wrapRead(async () => {
    const db = await getDatabase();
    return requestToPromise<T | undefined>(db.transaction(store, "readonly").objectStore(store).get(key));
  });

export const dbPut = async <T>(store: StoreName, value: T): Promise<T> =>
  wrapWrite(async () => {
    const db = await getDatabase();
    await requestToPromise(db.transaction(store, "readwrite").objectStore(store).put(value));
    return value;
  });

export const dbPutAll = async <T>(store: StoreName, values: T[]): Promise<void> =>
  wrapWrite(async () => {
    const db = await getDatabase();
    const objectStore = db.transaction(store, "readwrite").objectStore(store);
    await Promise.all(values.map((value) => requestToPromise(objectStore.put(value))));
  });

export const dbDelete = async (store: StoreName, key: IDBValidKey): Promise<void> =>
  wrapWrite(async () => {
    const db = await getDatabase();
    await requestToPromise(db.transaction(store, "readwrite").objectStore(store).delete(key));
  });

const dbMetaGet = async (key: string): Promise<boolean | undefined> =>
  wrapRead(async () => {
    const db = await getDatabase();
    return requestToPromise<boolean | undefined>(
      db.transaction(STORE.meta, "readonly").objectStore(STORE.meta).get(key)
    );
  });

const dbMetaSet = async (key: string, value: boolean): Promise<void> =>
  wrapWrite(async () => {
    const db = await getDatabase();
    await requestToPromise(db.transaction(STORE.meta, "readwrite").objectStore(STORE.meta).put(value, key));
  });

/** 首次打开时写入字符和课程种子；会话、答题、错题本始终从空开始 */
export const ensureSeedData = async (): Promise<void> => {
  const seeded = await dbMetaGet("seeded");
  if (seeded) return;
  await dbPutAll(STORE.symbols, seedBrailleSymbols);
  await dbPutAll(STORE.lessons, seedLessons);
  await dbMetaSet("seeded", true);
};
