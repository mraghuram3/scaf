"use client";

import { useState, use } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArgsEditor } from "./components/args-editor";
import { StepsEditor } from "./components/steps-editor";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth-provider";
import { Template, Language, Status, Argument, Step } from "@/types/template";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{
    username: string;
    templateId: string;
  }>;
}

export default function TemplatePage({ params }: PageProps) {
  const { username, templateId } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  // @ts-ignore
  const userID = user?.auth.currentUser.reloadUserInfo.screenName;
  const [template, setTemplate] = useState<Template>({
    name: "",
    description: "",
    version: "1.0.0",
    language: Language.TypeScript,
    createdBy: username,
    createdAt: new Date(),
    updatedBy: username,
    updatedAt: new Date(),
    tags: [],
    status: Status.Draft,
    args: [],
    steps: [],
  });

  // Check if user has permission to edit
  const hasEditPermission = userID === username;

  // Redirect if no permission
  if (!hasEditPermission) {
    router.push("/");
    return null;
  }

  const handleSave = async () => {
    try {
      // TODO: Implement save functionality
      toast({
        title: "Success",
        description: "Template saved successfully",
      });
      setIsEditMode(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const jsonString = JSON.stringify(template, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderBasicInfo = () => {
    if (isEditMode) {
      return (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={template.name}
                onChange={(e) =>
                  setTemplate({ ...template, name: e.target.value })
                }
                placeholder="Template name"
              />
            </div>
            <div>
              <Label>Version</Label>
              <Input
                value={template.version}
                onChange={(e) =>
                  setTemplate({ ...template, version: e.target.value })
                }
                placeholder="1.0.0"
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={template.description || ""}
              onChange={(e) =>
                setTemplate({ ...template, description: e.target.value })
              }
              placeholder="Template description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Language</Label>
              <Select
                value={template.language}
                onValueChange={(value) =>
                  setTemplate({ ...template, language: value as Language })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Language.Python}>Python</SelectItem>
                  <SelectItem value={Language.JavaScript}>
                    JavaScript
                  </SelectItem>
                  <SelectItem value={Language.TypeScript}>
                    TypeScript
                  </SelectItem>
                  <SelectItem value={Language.Go}>Go</SelectItem>
                  <SelectItem value={Language.Rust}>Rust</SelectItem>
                  <SelectItem value={Language.Shell}>Shell</SelectItem>
                  <SelectItem value={Language.CSharp}>C#</SelectItem>
                  <SelectItem value={Language.Java}>Java</SelectItem>
                  <SelectItem value={Language.C}>C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={template.status}
                onValueChange={(value) =>
                  setTemplate({ ...template, status: value as Status })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Status.Draft}>Draft</SelectItem>
                  <SelectItem value={Status.Published}>Published</SelectItem>
                  <SelectItem value={Status.Archived}>Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      );
    }

    return (
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label>Name</Label>
          <p className="text-sm">{template.name}</p>
        </div>
        <div className="grid gap-2">
          <Label>Version</Label>
          <p className="text-sm">{template.version}</p>
        </div>
        <div className="grid gap-2">
          <Label>Description</Label>
          <p className="text-sm">{template.description}</p>
        </div>
        <div className="grid gap-2">
          <Label>Language</Label>
          <p className="text-sm">{template.language}</p>
        </div>
        <div className="grid gap-2">
          <Label>Status</Label>
          <p className="text-sm">{template.status}</p>
        </div>
      </CardContent>
    );
  };

  const renderContent = () => {
    if (isEditMode) {
      return (
        <Tabs defaultValue="arguments">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="arguments">Arguments</TabsTrigger>
            <TabsTrigger value="steps">Steps</TabsTrigger>
          </TabsList>
          <TabsContent value="arguments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Template Arguments</CardTitle>
                <CardDescription>
                  Define the arguments that users can provide when using this
                  template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ArgsEditor
                  args={template.args as any[]}
                  onChange={(args) =>
                    setTemplate({ ...template, args: args as Argument[] })
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="steps" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Template Steps</CardTitle>
                <CardDescription>
                  Define the steps to execute when applying this template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StepsEditor
                  steps={template.steps as any[]}
                  onChange={(steps) =>
                    setTemplate({ ...template, steps: steps as Step[] })
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Arguments</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
              {/* {JSON.stringify(template.args, null, 2)} */}
              {template?.args?.map((arg) => {
                return (
                  <div key={arg.key}>
                    <p>{arg?.name}</p>
                    <p>{arg?.description}</p>
                    <p>{arg?.type}</p>
                    <p>{arg?.default}</p>
                    <p>{arg?.required}</p>
                    <p>{arg?.pattern}</p>
                    <ul>
                      {arg?.values?.map((value) => (
                        <li>
                          {value?.value} , {value?.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </pre>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
              {/* {JSON.stringify(template.steps, null, 2)} */}
              {template?.steps?.map((step) => {
                return (
                  <div key={step.id}>
                    <p>{step?.description}</p>
                    <p>{step?.type}</p>
                    <p>{step?.path}</p>
                    <p>{step?.content}</p>
                    <p>{step?.conditions?.operator}</p>
                    <ul>
                      {step?.conditions?.conditions?.map((condition) => (
                        <li>
                          {condition?.field} , {condition?.operator} ,{" "}
                          {condition?.value}
                        </li>
                      ))}
                    </ul>
                    <p>{step?.url}</p>
                  </div>
                );
              })}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8  mt-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Template Details</h1>
        <div className="space-x-4">
          {isEditMode ? (
            <Button onClick={handleSave}>Save Template</Button>
          ) : (
            <Button onClick={() => setIsEditMode(true)}>Edit Template</Button>
          )}
          <Button variant="outline" onClick={handleExport}>
            Export JSON
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              General information about the template
            </CardDescription>
          </CardHeader>
          {renderBasicInfo()}
        </Card>

        {renderContent()}
      </div>
    </div>
  );
}
