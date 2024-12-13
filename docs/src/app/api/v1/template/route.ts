import {cookies} from 'next/headers'
import {TemplateService} from "@/services/template";
import {NextResponse} from "next/server";
import {getPageParams} from "@/utils/helper";


export async function GET(request: Request) {
    try {
        const option = getPageParams(request)
        /// TODO: Make sure to handle the starred templates in the future if authenticated user has starred the template

        const result = await TemplateService.getTemplates(option);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error fetching templates:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}


/**
 * Create New Template API
 * With Body : Template
 * @param request
 */
export async function POST(
    request: Request
) {
    try {
        const body = await request.json();
        const template = await TemplateService.createTemplate(body);
        return NextResponse.json(template, { status: 200 });
    } catch (error) {
        console.error("Error fetching template info:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}