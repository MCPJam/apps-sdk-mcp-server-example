export type WorkspaceSummary = {
  gid: string;
  name: string;
};

export type TaskAssignee = {
  gid: string;
  name: string;
  email?: string | null;
  photoUrl?: string | null;
};

export type TaskDueToday = {
  gid: string;
  name: string;
  permalinkUrl: string;
  completed: boolean;
  dueOn: string | null;
  dueAt?: string | null;
  assignee?: TaskAssignee | null;
  projectNames: string[];
};

export type TaskListResult = {
  workspace: WorkspaceSummary;
  fetchedAtIso: string;
  tasks: TaskDueToday[];
  taskCount: number;
};

export type WorkspaceListResult = {
  workspaces: WorkspaceSummary[];
};

export type ListTasksDueTodayInput = {
  workspaceGid: string;
  includeCompleted?: boolean;
};

export type SearchTasksInput = {
  workspaceGid: string;
  text?: string;
  assigneeAny?: string[];
  projectsAny?: string[];
  sectionsAny?: string[];
  tagsAny?: string[];
  followersAny?: string[];
  completed?: boolean;
  limit?: number;
};

export type SearchTasksResult = {
  workspace: WorkspaceSummary;
  fetchedAtIso: string;
  tasks: TaskDueToday[];
  taskCount: number;
};

export type TaskDetail = {
  gid: string;
  name: string;
  completed: boolean;
  permalinkUrl: string;
  notes?: string | null;
  dueOn: string | null;
  dueAt?: string | null;
  createdAt: string;
  modifiedAt: string;
  assignee?: TaskAssignee | null;
  projectNames: string[];
  tags?: { gid: string; name: string }[];
};

export type GetTaskInput = {
  taskGid: string;
};

export type GetTaskResult = {
  task: TaskDetail;
  fetchedAtIso: string;
};

export type UpdateTaskInput = {
  taskGid: string;
  assignee?: string | null;
  dueOn?: string | null;
  dueAt?: string | null;
  completed?: boolean;
};

export type UpdateTaskResult = {
  task: TaskDetail;
  updatedAtIso: string;
};

export type TaskWidgetState = {
  selectedWorkspaceGid: string | null;
  includeCompleted?: boolean;
};