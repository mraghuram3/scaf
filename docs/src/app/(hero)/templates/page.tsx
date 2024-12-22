"use client"

import React, {useEffect, useState} from 'react';
import {ChevronRight, Download, List, Star} from 'lucide-react';
import {Template} from '@/types/template';
import {Button} from "@/components/ui/button"
import {SearchInput} from "@/components/ui/search-input";
import Link from "next/link";
import {useAuth} from "@/hooks/auth-provider";
import {CopyButton} from "@/components/ui/copy-button";
import {CreateTemplate} from "@/components/create-template";
import {PaginatedResponse} from "@/models/common";

export interface Filters {
    search: string;
    tags: string[];
    showPrivate: boolean;
}

export default function Page() {
    const {user} = useAuth();
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<Filters>({
        search: '',
        tags: [],
        showPrivate: false,
    });

    const [templates, setTemplates] = useState<Template[]>([]);
    useEffect(() => {
        fetch('/api/v1/template?limit=100')
            .then((res) => res.json())
            .then((data: PaginatedResponse<Template>) => {
                setTemplates(data.data);
            });
    }, []);

    return (
        <div className="min-h-screen mt-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold ">Marketplace</h1>

                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm">
                            <Star className="h-4 w-4 mr-2"/>
                            Starred
                        </Button>
                        {user && (
                            <>
                                <Button variant="outline" size="sm">
                                    <List className="h-4 w-4 mr-2"/>
                                    My Templates
                                </Button>
                                <CreateTemplate/>
                            </>
                        )}
                    </div>
                </div>
                <div className="rounded-lg shadow">
                    <div className="p-4 border-b">
                        <div className="flex justify-between items-center">
                            <SearchInput
                                placeholder="Search templates..."
                                value={search}
                                onChange={(e: {
                                    target: { value: React.SetStateAction<string>; };
                                }) => setSearch(e.target.value)}
                                className="w-96"
                            />
                        </div>
                    </div>

                    <div className="divide-y ">
                        {templates.map((template) => (
                            <Link
                                key={template._id}
                                className="p-4 cursor-pointer flex items-center justify-between hover:bg-muted/50 transition-colors"
                                href={`/${template._id}`}>
                                <div className="flex-1 pl-4">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="text-lg font-semibold text-blue-600">
                                            {template._id}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {template.description}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-8">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center justify-between gap-2 py-2 h-auto"
                                    >
                                        <Download className="h-4 w-4"/>
                                        {template.downloads}
                                    </Button>
                                    <CopyButton variant="outline" copyContent={`scaf run ${template.name}`}/>
                                    <ChevronRight/>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}