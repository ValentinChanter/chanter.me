export interface Cell {
    word: string;
    colors: string[];
    description: string;
}

export interface Player {
    publicID: string;
    username: string;
    color: string;
}