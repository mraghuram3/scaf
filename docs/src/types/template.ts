export interface UserObject {
  _id?: string; // uid from Firebase
  username: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export enum Language {
  Python = "python",
  JavaScript = "javascript",
  TypeScript = "typescript",
  Go = "go",
  Rust = "rust",
  Shell = "shell",
  CSharp = "csharp",
  Java = "java",
  C = "c",
}

export enum Status {
  Draft = "draft",
  Published = "published",
  Archived = "archived",
}

export interface CreateTemplate {
  _id?: string;
  name: string;
  version: string;
  description?: string;
  language: Language;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  tags: string[];
  status: Status;
}

export interface Template extends CreateTemplate {
  downloads?: number;
  args: Argument[];
  steps: Step[];
}

export enum ArgumentType {
  String = "string",
  Enum = "enum",
}

export interface Argument {
  _id?: string;
  name: string;
  key: string;
  description: string;
  type: ArgumentType;
  default?: string;
  required: boolean;
  pattern?: string;
  values?: ArgumentValue[];
  multiple?: boolean;
  delimiter?: string;
}

export interface ArgumentValue {
  _id?: string;
  value: string;
  description: string;
}

export interface Step {
  id: string;
  description: string;
  type: string;
  path: string;
  content?: string;
  conditions?: ConditionGroup;
  url?: string;
}

export interface ConditionGroup {
  operator: string;
  conditions: Condition[];
}

export interface Condition {
  field: string;
  operator: string;
  value: string;
}
