export interface TemplateArg {
    name: string;
    default: string;
}

export interface TemplateExtend {
    template_id: string;
    version: string;
    args: TemplateArg[];
}

export interface TemplateStep {
    id: string;
    description: string;
    type: string;
    path?: string;
    content: string;
}

export interface TemplateSchema {
    $schema: string;
    version: string;
    name: string;
    description: string;
    author: string;
    language: string;
    tags: string[];
    args: TemplateArg[];
    extends: TemplateExtend[];
    steps: TemplateStep[];
}