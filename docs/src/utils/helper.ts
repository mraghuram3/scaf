import {PageOptionV2} from "@/models/common";



export function getPageParams(request: Request): PageOptionV2 {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") ||1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10") || 10));
    const search = searchParams.get("search") || undefined;
    const skip = (page - 1) * limit;
    return {page, limit, skip, search};
}