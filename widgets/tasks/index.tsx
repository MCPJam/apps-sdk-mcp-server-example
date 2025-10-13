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
    <div className="w-full p-4 border border-gray-200 rounded-lg bg-white">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          📋 Tasks Due Today
        </h2>
        <p className="text-sm text-gray-600">
          {workspace.name} • {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
        </p>
      </div>

      {taskCount === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-sm">No tasks due today!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.gid}
              className={`p-3 rounded-lg border ${
                task.completed
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="text-lg mt-0.5">
                  {task.completed ? '✅' : '📌'}
                </div>
                <div className="flex-1 min-w-0">
                  <a
                    href={task.permalinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-medium hover:underline ${
                      task.completed
                        ? 'text-gray-600 line-through'
                        : 'text-gray-900'
                    }`}
                  >
                    {task.name}
                  </a>

                  {task.projectNames.length > 0 && (
                    <div className="text-xs text-gray-600 mt-1">
                      📁 {task.projectNames.join(', ')}
                    </div>
                  )}

                  {task.assignee && (
                    <div className="flex items-center gap-1 mt-1">
                      {task.assignee.photoUrl ? (
                        <img
                          src={task.assignee.photoUrl}
                          alt={task.assignee.name}
                          className="w-4 h-4 rounded-full"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                          👤
                        </div>
                      )}
                      <span className="text-xs text-gray-600">
                        {task.assignee.name}
                      </span>
                    </div>
                  )}

                  {task.dueAt && (
                    <div className="text-xs text-gray-500 mt-1">
                      🕒 {new Date(task.dueAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          Updated: {new Date(fetchedAtIso).toLocaleString()}
        </p>
      </div>

      {/* Debug Info */}
      <details className="mt-4 text-[10px] opacity-50">
        <summary className="cursor-pointer font-semibold hover:opacity-75">
          Debug Info
        </summary>
        <div className="mt-2">
          <div className="font-semibold">Output:</div>
          <pre className="bg-gray-100 p-2 rounded overflow-auto text-[9px] max-h-40">
            {JSON.stringify(output, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
}

createRoot(document.getElementById('tasks-root')!).render(<App />);
