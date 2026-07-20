const http = require('node:http');
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('tasks.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1))
  )
`);
db.exec('CREATE INDEX IF NOT EXISTS idx_tasks_title ON tasks (title)');

const taskCount = db.prepare('SELECT COUNT(*) AS count FROM tasks');
const seedTask = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
db.exec('BEGIN IMMEDIATE');
try {
  if (taskCount.get().count === 0) {
    for (const title of ['Buy groceries', 'Walk the dog', 'Read a book']) {
      seedTask.run(title, 0);
    }
  }
  db.exec('COMMIT');
} catch (error) {
  db.exec('ROLLBACK');
  throw error;
}

const allTasks = db.prepare('SELECT id, title, done FROM tasks ORDER BY id');
const taskById = db.prepare('SELECT id, title, done FROM tasks WHERE id = ?');
const createTask = db.prepare(`
  INSERT INTO tasks (title, done) VALUES (?, ?)
  RETURNING id, title, done
`);
const updateTask = db.prepare(`
  UPDATE tasks SET title = ?, done = ? WHERE id = ?
  RETURNING id, title, done
`);
const deleteTask = db.prepare('DELETE FROM tasks WHERE id = ?');

function asJsonTask(task) {
  return { ...task, done: task.done === 1 };
}

function sendJson(response, status, value) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(value));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function validateTask(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)
      || typeof body.title !== 'string' || !body.title.trim()) {
    return 'Title is required';
  }
  if ('done' in body && typeof body.done !== 'boolean') {
    return 'Done must be a boolean';
  }
  return null;
}

const server = http.createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const match = pathname.match(/^\/tasks\/(\d+)$/);

    if (request.method === 'GET' && pathname === '/tasks') {
      return sendJson(response, 200, allTasks.all().map(asJsonTask));
    }

    if (request.method === 'POST' && pathname === '/tasks') {
      let body;
      try {
        body = await readJson(request);
      } catch {
        return sendJson(response, 400, { error: 'Invalid request body' });
      }

      const error = validateTask(body);
      if (error) return sendJson(response, 400, { error });

      return sendJson(
        response,
        201,
        asJsonTask(createTask.get(body.title, body.done ? 1 : 0)),
      );
    }

    if (match) {
      const id = Number(match[1]);
      if (!Number.isSafeInteger(id)) {
        return sendJson(response, 404, { error: 'Task not found' });
      }

      if (request.method === 'GET') {
        const task = taskById.get(id);
        return task
          ? sendJson(response, 200, asJsonTask(task))
          : sendJson(response, 404, { error: 'Task not found' });
      }

      if (request.method === 'PUT') {
        let body;
        try {
          body = await readJson(request);
        } catch {
          return sendJson(response, 400, { error: 'Invalid request body' });
        }

        const error = validateTask(body);
        if (error) return sendJson(response, 400, { error });

        const task = updateTask.get(body.title, body.done ? 1 : 0, id);
        return task
          ? sendJson(response, 200, asJsonTask(task))
          : sendJson(response, 404, { error: 'Task not found' });
      }

      if (request.method === 'DELETE') {
        if (deleteTask.run(id).changes === 0) {
          return sendJson(response, 404, { error: 'Task not found' });
        }
        response.writeHead(204);
        return response.end();
      }
    }

    return sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    return sendJson(response, 500, { error: 'Internal server error' });
  }
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => console.log(`Server listening on port ${port}`));
