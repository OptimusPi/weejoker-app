// Cloudflare D1 bindings
interface CloudflareEnv {
    DB: D1Database;
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
