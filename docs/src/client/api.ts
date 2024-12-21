import { ITemplate } from "@/models/template";

interface CreateTemplateParams {
    _id: string;
    name: string;
    description?: string;
}

interface GetTemplatesParams {
    page?: number;
    limit?: number;
    search?: string;
}

interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface TemplateApiResponse<T> {
    data?: T;
    error?: string;
}

export class API {
    private static async getAuthHeaders(): Promise<Headers> {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        return headers;
    }

    static async createTemplate(
        params: CreateTemplateParams,
        token: string
    ): Promise<TemplateApiResponse<ITemplate>> {
        try {
            const headers = await this.getAuthHeaders();
            headers.append("Authorization", `Bearer ${token}`);

            const response = await fetch("/api/v1/template", {
                method: "POST",
                headers,
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: error.error || "Failed to create template" };
            }

            const { template } = await response.json();
            return { data: template };
        } catch (error) {
            console.error("Error creating template:", error);
            return { error: "Failed to create template" };
        }
    }

    static async getTemplates(
        params: GetTemplatesParams = {}
    ): Promise<TemplateApiResponse<PaginatedResponse<ITemplate>>> {
        try {
            const headers = await this.getAuthHeaders();
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.append("page", params.page.toString());
            if (params.limit) queryParams.append("limit", params.limit.toString());
            if (params.search) queryParams.append("search", params.search);

            const response = await fetch(`/api/template?${queryParams.toString()}`, {
                method: "GET",
                headers,
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: error.error || "Failed to fetch templates" };
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            console.error("Error fetching templates:", error);
            return { error: "Failed to fetch templates" };
        }
    }
}

