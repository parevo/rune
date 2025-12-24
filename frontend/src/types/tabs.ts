
export interface Tab {
    id: string;
    type: 'query' | 'table';
    title: string;
    data?: {
        db: string;
        table: string;
    };
}
