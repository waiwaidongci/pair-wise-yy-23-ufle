import { LOCAL_DB_NAME, LOCAL_DB_VERSION, LOCAL_STORE } from "../constants/practice";
import { ERROR_CODES } from "../constants/errorCodes";
import { ServiceError } from "../utils/errors";
import { seedBrailleSymbols, seedLessons } from "../mocks/seedData";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new ServiceError(ERROR_CODES.LOCAL_DB_UNAVAILABLE));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(LOCAL_DB_NAME, LOCAL_DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(LOCAL_STORE.symbols)) {
          db.createObjectStore(LOCAL_STORE.symbols, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(LOCAL_STORE.lessons)) {
          db.createObjectStore(LOCAL_STORE.lessons, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(LOCAL_STORE.sessions)) {
          const store = db.createObjectStore(LOCAL_STORE.sessions, { keyPath: "id" });
          store.createIndex("lesson_id", "lesson_id", { unique: false });
        }
        if (!db.objectStoreNames.contains(LOCAL_STORE.answers)) {
          const store = db.createObjectStore(LOCAL_STORE.answers, { keyPath: "id" });
          store.createIndex("session_id", "session_id", { unique: false });
        }
        if (!db.objectStoreNames.contains(LOCAL_STORE.mistakes)) {
          db.createObjectStore(LOCAL_STORE.mistakes, { keyPath: "symbol_id" });
        }
        if (!db.objectStoreNames.contains(LOCAL_STORE.draft)) {
          db.createObjectStore(LOCAL_STORE.draft, { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(new ServiceError(ERROR_CODES.LOCAL_DB_UNAVAILABLE, req.error?.message));
    });
  }
  return dbPromise;
}

async function tx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const req = run(transaction.objectStore(storeName));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new ServiceError(ERROR_CODES.LOCAL_DB_UNAVAILABLE, req.error?.message));
    transaction.onabort = () => reject(new ServiceError(ERROR_CODES.LOCAL_DB_UNAVAILABLE, transaction.error?.message));
  });
}

export async function getAll<T>(storeName: string): Promise<T[]> {
  return tx<T[]>(storeName, "readonly", (store) => store.getAll() as IDBRequest<T[]>);
}

export async function get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
  return tx<T | undefined>(storeName, "readonly", (store) => store.get(key) as IDBRequest<T | undefined>);
}

export async function put<T>(storeName: string, value: T): Promise<T> {
  await tx<IDBValidKey>(storeName, "readwrite", (store) => store.put(value as unknown as Record<string, unknown>));
  return value;
}

export async function bulkPut<T>(storeName: string, values: T[]): Promise<T[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    values.forEach((value) => store.put(value));
    transaction.oncomplete = () => resolve(values);
    transaction.onerror = () =>
      reject(new ServiceError(ERROR_CODES.LOCAL_DB_UNAVAILABLE, transaction.error?.message));
  });
}

export async function remove(storeName: string, key: IDBValidKey): Promise<void> {
  await tx(storeName, "readwrite", (store) => store.delete(key));
}

/** 首次启动时灌入种子课程与字符 */
export async function ensureSeeded(): Promise<void> {
  const symbols = await getAll<unknown>(LOCAL_STORE.symbols);
  if (symbols.length === 0) {
    await bulkPut(LOCAL_STORE.symbols, seedBrailleSymbols);
    await bulkPut(LOCAL_STORE.lessons, seedLessons);
  }
}

export async function resetDatabase(): Promise<void> {
  const db = await openDb();
  db.close();
  dbPromise = null;
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(LOCAL_DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
  await ensureSeeded();
}
