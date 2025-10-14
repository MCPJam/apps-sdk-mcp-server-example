import { createRoot } from 'react-dom/client';
import './index.css';
import { useToolOutput } from '../utils/use-tool-output.ts';
import type { TaskListResult, TaskDueToday } from '@asana-chatgpt-app/shared-types';
import { useState } from 'react';

function TaskDetail({ task, onBack }: { task: TaskDueToday; onBack: () => void }) {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back to list</span>
        </button>
      </div>

      {/* Task Detail Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Task Title */}
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
              task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
            }`}>
              {task.completed && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h1 className={`text-2xl font-semibold ${
                task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
              }`}>
                {task.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Task Metadata Grid */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          {/* Assignee */}
          {task.assignee && (
            <div className="flex items-start gap-4">
              <div className="w-24 text-sm font-medium text-gray-600">Assignee</div>
              <div className="flex items-center gap-3">
                {task.assignee.photoUrl ? (
                  <img
                    src={task.assignee.photoUrl}
                    alt={task.assignee.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900">{task.assignee.name}</div>
                  {task.assignee.email && (
                    <div className="text-xs text-gray-500">{task.assignee.email}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Due Date */}
          {task.dueOn && (
            <div className="flex items-start gap-4">
              <div className="w-24 text-sm font-medium text-gray-600">Due date</div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="text-sm text-gray-900">
                    {new Date(task.dueOn).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  {task.dueAt && (
                    <div className="text-xs text-gray-500">
                      at {new Date(task.dueAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Projects */}
          {task.projectNames.length > 0 && (
            <div className="flex items-start gap-4">
              <div className="w-24 text-sm font-medium text-gray-600">
                {task.projectNames.length === 1 ? 'Project' : 'Projects'}
              </div>
              <div className="flex flex-wrap gap-2">
                {task.projectNames.map((projectName, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    {projectName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-start gap-4">
            <div className="w-24 text-sm font-medium text-gray-600">Status</div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
              task.completed
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {task.completed ? 'Completed' : 'In Progress'}
            </span>
          </div>
        </div>

        {/* Open in Asana Button */}
        <div className="mt-8">
          <a
            href={task.permalinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#f06a6a] hover:bg-[#e05555] text-white font-medium rounded-lg transition-colors"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/3b/Asana_logo.svg"
              alt="Asana"
              className="h-4 brightness-0 invert"
            />
            <span>Open in Asana</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

function App() {
  const output = useToolOutput<TaskListResult>();
  const [selectedTask, setSelectedTask] = useState<TaskDueToday | null>(null);

  const handleTaskClick = (task: TaskDueToday) => {
    setSelectedTask(task);
  };

  const handleBack = () => {
    setSelectedTask(null);
  };

  if (output === null || !output.workspace) {
    return (
      <div className="w-full p-4 border border-gray-200 rounded-lg bg-white">
        <div className="flex items-center justify-center gap-2 min-h-[200px]">
          <div className="text-2xl animate-pulse">Loading...</div>
          <span className="text-gray-600">Loading tasks...</span>
        </div>
      </div>
    );
  }

  const { workspace, tasks, taskCount, fetchedAtIso } = output;

  // Show task detail view inline
  if (selectedTask) {
    return <TaskDetail task={selectedTask} onBack={handleBack} />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header - Asana Style */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Tasks due today</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {workspace.name} • {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
            </p>
          </div>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/3b/Asana_logo.svg"
            alt="Asana"
            className="h-6 opacity-60"
          />
        </div>
      </div>

      {/* Content - Asana List Style */}
      <div className="divide-y divide-gray-200">
        {taskCount === 0 ? (
          <div className="text-center py-16 px-6">
            <p className="text-base text-gray-700 font-medium">No tasks due today</p>
            <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <>
            {tasks.map((task) => (
              <div
                key={task.gid}
                onClick={() => handleTaskClick(task)}
                className={`group px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start">
                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`block text-sm font-normal hover:text-gray-900 transition-colors ${
                        task.completed
                          ? 'text-gray-500 line-through'
                          : 'text-gray-800'
                      }`}
                    >
                      {task.name}
                    </div>

                    {/* Metadata - Asana Style */}
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      {task.projectNames.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          <span>{task.projectNames.join(', ')}</span>
                        </div>
                      )}

                      {task.assignee && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          {task.assignee.photoUrl ? (
                            <img
                              src={task.assignee.photoUrl}
                              alt={task.assignee.name}
                              className="w-5 h-5 rounded-full"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                              <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <span>{task.assignee.name}</span>
                        </div>
                      )}

                      {task.dueAt && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>
                            {new Date(task.dueAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Last updated: {new Date(fetchedAtIso).toLocaleString()}
        </p>
      </div>

      {/* Debug Info */}
      <details className="px-6 py-3 border-t border-gray-200 text-[10px] text-gray-400">
        <summary className="cursor-pointer text-xs hover:text-gray-600 transition-colors">
          Debug Info
        </summary>
        <div className="mt-2">
          <pre className="bg-gray-100 p-2 rounded overflow-auto text-[9px] max-h-40">
            {JSON.stringify(output, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
}

createRoot(document.getElementById('tasks-root')!).render(<App />);
