/**
 * Motely API Client
 * Based on Swagger schema from http://192.168.0.171:3141/swagger/v1/swagger.json
 */

const API_BASE = process.env.NEXT_PUBLIC_MOTELY_API_URL || 'motelyjaml-pi.8pi.me';

// ============================================================================
// REQUEST TYPES (from Swagger)
// ============================================================================

export interface FilterSaveRequest {
    filterId?: string;
    filterJaml?: string;
    createNew?: boolean;
}

export interface SearchStartRequest {
    filterId?: string;
    deck?: string;
    stake?: string;
    seedCount?: number;
    startBatch?: number;
    cutoff?: number;
    seedSource?: string;
}

export interface SearchStopRequest {
    searchId?: string;
}

// ============================================================================
// RESPONSE TYPES (inferred from usage)
// ============================================================================

export interface FilterInfo {
    filterId: string;
    filePath: string;
    searchId: string;
    columns: string[];
    jaml?: string;
}

export interface SearchResult {
    seed: string;
    score: number;
    [key: string]: string | number | number[];
}

export interface SearchStatus {
    searchId: string;
    isRunning: boolean;
    progress?: number;
    results?: SearchResult[];
    error?: string;
}

export interface HealthResponse {
    status: string;
    timestamp: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

class MotelyApi {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE) {
        this.baseUrl = baseUrl;
    }

    // --- Health ---
    async health(): Promise<HealthResponse> {
        const res = await fetch(`${this.baseUrl}/health`);
        if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
        return res.json();
    }

    // --- Filters ---
    async getFilters(): Promise<FilterInfo[]> {
        const res = await fetch(`${this.baseUrl}/filters`);
        if (!res.ok) throw new Error(`Get filters failed: ${res.statusText}`);
        return res.json();
    }

    async saveFilter(request: FilterSaveRequest): Promise<{ filterId: string }> {
        const res = await fetch(`${this.baseUrl}/filters/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: res.statusText }));
            throw new Error(err.error || `Save filter failed: ${res.statusText}`);
        }
        return res.json();
    }

    async deleteFilter(id: string): Promise<void> {
        const res = await fetch(`${this.baseUrl}/filters/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error(`Delete filter failed: ${res.statusText}`);
    }

    // --- Search ---
    async startSearch(request: SearchStartRequest): Promise<{ searchId: string }> {
        const res = await fetch(`${this.baseUrl}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: res.statusText }));
            throw new Error(err.error || `Start search failed: ${res.statusText}`);
        }
        return res.json();
    }

    async getSearchStatus(searchId: string): Promise<SearchStatus> {
        const res = await fetch(`${this.baseUrl}/search/${encodeURIComponent(searchId)}`);
        if (!res.ok) throw new Error(`Get search status failed: ${res.statusText}`);
        return res.json();
    }

    async stopSearch(request: SearchStopRequest): Promise<void> {
        const res = await fetch(`${this.baseUrl}/search/stop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!res.ok) throw new Error(`Stop search failed: ${res.statusText}`);
    }

    // --- Analyze ---
    async analyze(seed: string, deck = 'Red', stake = 'White'): Promise<any> {
        const params = new URLSearchParams({ seed, deck, stake });
        const res = await fetch(`${this.baseUrl}/analyze?${params}`);
        if (!res.ok) throw new Error(`Analyze failed: ${res.statusText}`);
        return res.json();
    }

    // --- Seed Sources ---
    async searchSeedsRemote(jaml: string, seedCount = 50): Promise<SearchResult[]> {
        // 1. Save filter
        const { filterId } = await this.saveFilter({ filterJaml: jaml, createNew: true });
        // 2. Start search
        const { searchId } = await this.startSearch({ filterId, seedCount });

        // 3. For now, since this is async on the server, we return an empty array 
        // and let the caller poll or use SignalR via SearchChat.
        return [];
    }
}

export const motelyApi = new MotelyApi();
