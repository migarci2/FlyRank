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

const seed = db.prepare('INSERT INTO tasks (title) VALUES (?)');
if (db.prepare('SELECT COUNT(*) AS count FROM tasks').get().count === 0) {
  for (const title of ['Buy groceries', 'Walk the dog', 'Read a book']) {
    seed.run(title);
  }
}

const allTasks = db.prepare('SELECT id, title, done FROM tasks ORDER BY id');
const taskById = db.prepare('SELECT id, title, done FROM tasks WHERE id = ?');
const createTask = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
const updateTask = db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?');
const deleteTask = db.prepare('DELETE FROM tasks WHERE id = ?');

function asJsonTask(task) {
  return task && { ...task, done: task.done === 1 };
}

function sendJson(response, status, value) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(value));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1_000_000) throw new Error('Request body too large');
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new Error('Invalid JSON');
  }
}

function validTitle(title) {
  return typeof title === 'string' && title.trim().length > 0;
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
      } catch (error) {
        return sendJson(response, 400, { error: error.message });
      }

      if (!body || typeof body !== 'object' || Array.isArray(body) || !validTitle(body.title)) {
        return sendJson(response, 400, { error: 'Title is required' });
      }
      if ('done' in body && typeof body.done !== 'boolean') {
        return sendJson(response, 400, { error: 'Done must be a boolean' });
      }

      const result = createTask.run(body.title, body.done ? 1 : 0);
      return sendJson(response, 201, asJsonTask(taskById.get(result.lastInsertRowid)));
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
        } catch (error) {
          return sendJson(response, 400, { error: error.message });
        }

        if (!body || typeof body !== 'object' || Array.isArray(body) || !validTitle(body.title)) {
          return sendJson(response, 400, { error: 'Title is required' });
        }
        if ('done' in body && typeof body.done !== 'boolean') {
          return sendJson(response, 400, { error: 'Done must be a boolean' });
        }
        if (updateTask.run(body.title, body.done ? 1 : 0, id).changes === 0) {
          return sendJson(response, 404, { error: 'Task not found' });
        }

        return sendJson(response, 200, asJsonTask(taskById.get(id)));
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
