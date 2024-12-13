
export interface PageOptionV2 {
    page: number, limit: number, skip: number, search?: string
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}