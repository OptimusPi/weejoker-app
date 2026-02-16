export interface CreateRitualRequest {
    id: string;
    title: string;
    tagline?: string;
    author?: string;
    defaultObjective?: string;
    epoch?: string;
    jaml: string;
    seeds: string[];
}

export interface RitualConfig {
    id: string;
    title: string;
    tagline: string;
    epoch: string;
    defaultObjective: string;
    jamlPath: string;
    seedsPath: string;
    seeds?: string[];
    author?: string;
}
