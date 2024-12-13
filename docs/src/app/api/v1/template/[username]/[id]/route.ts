import {getPageParams} from "@/utils/helper";
import {TemplateService} from "@/services/template";
import {NextResponse, type NextRequest} from "next/server";


export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string; id: string }> }
) {
    try {
        const { username, id } = await params;

        const result = await TemplateService.getTemplateById(`${username}/${id}`);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error fetching templates:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ username: string; id: string }> }
) {
    try {
        const { username, id } = await params;
        const templateId = `${username}/${id}`;

        const result = await TemplateService.updateTemplate(
            templateId, {status: "discarded"}
        );
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error fetching templates:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ username: string; id: string }> }
) {
    try {
        const { username, id } = await params;
        const templateId = `${username}/${id}`;


        return NextResponse.json({}, { status: 200 });
    } catch (error) {
        console.error("Error fetching template info:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

