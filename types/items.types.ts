export interface ItemsSchema {
    ProductName: string;
    MinLimit?: number;
    MaxLimit?: number;
    Source?: string;
    Specification?: string;
    Width?: number;
    Hieght?: number;
    CardImage?: Buffer;
    CardCode?: string;
}