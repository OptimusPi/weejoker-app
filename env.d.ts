// Cloudflare D1 & R2 bindings
interface CloudflareEnv {
    DB: D1Database;
    SEED_ASSETS: R2Bucket;
}

interface R2Bucket {
    get(key: string): Promise<R2ObjectBody | null>;
}

interface R2ObjectBody {
    body: ReadableStream;
    text(): Promise<string>;
    json<T>(): Promise<T>;
    arrayBuffer(): Promise<ArrayBuffer>;
}

// D1 Database types (simplified)
interface D1Database {
    prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
    all<T = unknown>(): Promise<D1Result<T>>;
    first<T = unknown>(colName?: string): Promise<T | null>;
    run(): Promise<D1Result<unknown>>;
}

interface D1Result<T> {
    results: T[];
    success: boolean;
    meta: {
        last_row_id: number;
        changes: number;
    };
}
