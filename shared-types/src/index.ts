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

export type TaskWidgetState = {
  selectedWorkspaceGid: string | null;
  includeCompleted?: boolean;
};