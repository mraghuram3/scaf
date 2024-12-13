// export interface BTemplate {
//   id: string;
//   name: string;
//   description: string;
//   tags: string[];
//   author: string;
//   createdAt: Date;
//   downloads?: number;
// }
//
// export interface BTemplateFilters {
//   search: string;
//   tags: string[];
//   showPrivate: boolean;
// }

export interface UserObject {
  _id?: string;  // uid from Firebase
  username: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}


export interface Template {
  _id?: string;
  name: string;
  version: string;
  description: string;
  author: string;
  language: string;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  tags: string[];
  status: string;
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