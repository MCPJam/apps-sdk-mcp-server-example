import { createRoot } from 'react-dom/client';
import './index.css';
import { useToolOutput } from '../utils/use-tool-output.ts';
import type { TaskListResult } from '@asana-chatgpt-app/shared-types';

console.log('[Widget] Module loaded successfully');
console.log('[Widget] React version:', import.meta.env.MODE);

function App() {
  console.log('[Widget] App component rendering');
  const output = useToolOutput<TaskListResult>();

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
                className={`group px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start">
                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <a
                      href={task.permalinkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block text-sm font-normal hover:text-gray-900 transition-colors ${
                        task.completed
                          ? 'text-gray-500 line-through'
                          : 'text-gray-800'
                      }`}
                    >
                      {task.name}
                    </a>

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
