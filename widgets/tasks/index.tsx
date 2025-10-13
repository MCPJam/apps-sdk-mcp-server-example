import { createRoot } from 'react-dom/client';
import './index.css';
import { useToolOutput } from '../utils/use-tool-output';
import type { TaskListResult } from '@asana-chatgpt-app/shared-types';

function App() {
  const output = useToolOutput<TaskListResult>();

  if (output === null || !output.workspace) {
    return (
      <div className="w-full p-4 border border-gray-200 rounded-lg bg-white">
        <div className="flex items-center justify-center gap-2 min-h-[200px]">
          <div className="text-2xl animate-pulse">⏳</div>
          <span className="text-gray-600">Loading tasks...</span>
        </div>
      </div>
    );
  }

  const { workspace, tasks, taskCount, fetchedAtIso } = output;

  return (
    <div className="w-full max-w-3xl mx-auto bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">📋</span>
          <h2 className="text-xl font-bold">Tasks Due Today</h2>
        </div>
        <p className="text-blue-100 text-sm">
          {workspace.name} • {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        {taskCount === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-3">🎉</div>
            <p className="text-lg font-medium text-gray-700">All clear!</p>
            <p className="text-sm text-gray-500 mt-1">No tasks due today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.gid}
                className={`group relative rounded-lg border-2 transition-all hover:shadow-md ${
                  task.completed
                    ? 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    : 'bg-white border-blue-200 hover:border-blue-300 hover:shadow-blue-100'
                }`}
              >
                <div className="p-4">
                  <div className="flex gap-3">
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`text-2xl ${task.completed ? 'opacity-60' : ''}`}>
                        {task.completed ? '✅' : '🎯'}
                      </div>
                    </div>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <a
                        href={task.permalinkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block text-base font-semibold group-hover:text-blue-600 transition-colors ${
                          task.completed
                            ? 'text-gray-500 line-through'
                            : 'text-gray-900'
                        }`}
                      >
                        {task.name}
                      </a>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {task.projectNames.length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <span className="text-base">📁</span>
                            <span className="font-medium">{task.projectNames.join(', ')}</span>
                          </div>
                        )}

                        {task.assignee && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            {task.assignee.photoUrl ? (
                              <img
                                src={task.assignee.photoUrl}
                                alt={task.assignee.name}
                                className="w-5 h-5 rounded-full border border-gray-200"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-xs">
                                👤
                              </div>
                            )}
                            <span className="font-medium">{task.assignee.name}</span>
                          </div>
                        )}

                        {task.dueAt && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <span className="text-base">🕐</span>
                            <span className="font-medium">
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Updated: {new Date(fetchedAtIso).toLocaleString()}
        </p>
      </div>

      {/* Debug Info */}
      <details className="px-6 py-3 border-t border-gray-200 text-[10px] text-gray-400">
        <summary className="cursor-pointer font-semibold hover:text-gray-600 transition-colors">
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
