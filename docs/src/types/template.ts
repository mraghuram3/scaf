export interface UserObject {
  _id?: string;  // uid from Firebase
  username: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}


export interface CreateTemplate {
  _id?: string;
  name: string;
  version: string;
  description?: string;
  language: string;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  tags: string[];
  status: string;
}

export interface Template extends CreateTemplate{
  downloads?: number;
  args: Argument[];
  steps: Step[];
}

export interface Argument {
  _id?: string;
  name: string;
  key: string;
  description: string;
  type: string;
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