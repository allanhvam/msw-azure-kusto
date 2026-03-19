function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderDashboardPage(options?: {
  initialDatabase?: string;
  initialQuery?: string;
}): string {
  const initialDatabase = escapeHtml(options?.initialDatabase ?? 'Samples');
  const initialQuery = escapeHtml(options?.initialQuery ?? 'print Message = "Kusto dashboard ready"');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Kusto Dashboard</title>
    <style>
      :root {
        --bg: #edf2f8;
        --panel: #ffffff;
        --chrome: #f4f7fb;
        --line: #d6dee7;
        --line-strong: #b8c5d4;
        --text: #112033;
        --muted: #5a6d82;
        --primary: #0669d1;
        --primary-strong: #0058b8;
        --primary-soft: #e4f0ff;
        --success: #0d7f5f;
        --danger: #a6323a;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        min-height: 100%;
        background: radial-gradient(120% 180% at 100% 0%, #ffffff 0%, var(--bg) 52%, #dce6f3 100%);
        color: var(--text);
        font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
      }

      .shell {
        display: grid;
        grid-template-columns: 250px 1fr;
        min-height: 100vh;
      }

      .rail {
        border-right: 1px solid var(--line);
        background: linear-gradient(180deg, #f8fbff 0%, #edf3fb 100%);
        padding: 16px 10px;
      }

      .rail h2 {
        margin: 2px 8px 14px;
        font-size: 15px;
        letter-spacing: 0.01em;
      }

      .rail-actions {
        display: flex;
        gap: 8px;
        margin: 0 6px 16px;
      }

      .chip {
        border: 1px solid var(--line);
        background: #fff;
        color: var(--muted);
        border-radius: 8px;
        font-size: 12px;
        padding: 4px 8px;
      }

      .cluster {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .cluster li {
        margin: 0 4px 8px;
        border: 1px solid var(--line-strong);
        border-radius: 10px;
        padding: 10px 12px;
        background: linear-gradient(120deg, #f9fbfe 0%, #eaf2fc 100%);
        box-shadow: 0 4px 10px rgba(17, 32, 51, 0.05);
      }

      .cluster .name {
        display: block;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .cluster .meta {
        margin-top: 4px;
        color: var(--muted);
        font-size: 12px;
      }

      .main {
        display: grid;
        grid-template-rows: auto 1fr auto;
      }

      .toolbar {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        padding: 10px 12px;
        border-bottom: 1px solid var(--line);
        background: var(--chrome);
      }

      .run {
        background: linear-gradient(180deg, var(--primary) 0%, var(--primary-strong) 100%);
        border: none;
        border-radius: 8px;
        padding: 8px 16px;
        color: #fff;
        font-weight: 700;
        letter-spacing: 0.01em;
        cursor: pointer;
      }

      .run:disabled {
        opacity: 0.65;
        cursor: wait;
      }

      label {
        font-size: 12px;
        color: var(--muted);
      }

      input,
      textarea {
        border: 1px solid var(--line-strong);
        border-radius: 8px;
        padding: 8px 10px;
        color: var(--text);
        background: #fff;
        font: 13px/1.45 "IBM Plex Mono", "Cascadia Code", monospace;
      }

      input {
        width: 240px;
      }

      .editor-wrap {
        padding: 14px;
        display: grid;
        grid-template-rows: minmax(220px, 40vh) 1fr;
        gap: 14px;
      }

      textarea {
        width: 100%;
        height: 100%;
        resize: vertical;
      }

      .results {
        border: 1px solid var(--line);
        border-radius: 12px;
        background: var(--panel);
        overflow: hidden;
        box-shadow: 0 12px 24px rgba(17, 32, 51, 0.06);
        display: grid;
        grid-template-rows: auto auto 1fr;
        min-height: 0;
      }

      .status {
        padding: 10px 12px;
        border-bottom: 1px solid var(--line);
        background: #f8fbff;
        font-size: 12px;
        color: var(--muted);
      }

      .status.success {
        color: var(--success);
      }

      .status.error {
        color: var(--danger);
      }

      .table-wrap {
        overflow: auto;
        max-height: 36vh;
        border-bottom: 1px solid var(--line);
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font: 12px/1.45 "IBM Plex Mono", "Cascadia Code", monospace;
      }

      thead {
        position: sticky;
        top: 0;
        background: #eff5fc;
      }

      th,
      td {
        text-align: left;
        padding: 7px 10px;
        border-bottom: 1px solid #e7edf5;
        vertical-align: top;
      }

      th {
        color: #2d435a;
      }

      .raw {
        margin: 0;
        padding: 12px;
        overflow: auto;
        font: 12px/1.45 "IBM Plex Mono", "Cascadia Code", monospace;
        background: #fbfdff;
      }

      @media (max-width: 920px) {
        .shell {
          grid-template-columns: 1fr;
        }

        .rail {
          border-right: none;
          border-bottom: 1px solid var(--line);
        }

        input {
          width: 100%;
          max-width: 360px;
        }
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <aside class="rail">
        <h2>Connections</h2>
        <ul class="cluster">
          <li>
            <span class="name">kusto.local</span>
            <div class="meta">Local emulated cluster</div>
          </li>
        </ul>
      </aside>

      <section class="main">
        <div class="toolbar">
          <button class="run" id="runButton" type="button">Run</button>
          <label>
            Database
            <input id="dbInput" value="${initialDatabase}" spellcheck="false" />
          </label>
          <span class="chip">Ctrl/Cmd + Enter</span>
        </div>

        <div class="editor-wrap">
          <textarea id="queryInput" spellcheck="false">${initialQuery}</textarea>

          <div class="results">
            <div class="status" id="status">Ready</div>
            <div class="table-wrap">
              <table>
                <thead id="resultHead"></thead>
                <tbody id="resultBody"></tbody>
              </table>
            </div>
            <pre class="raw" id="rawResult">No result yet.</pre>
          </div>
        </div>
      </section>
    </div>

    <script>
      const runButton = document.getElementById('runButton');
      const dbInput = document.getElementById('dbInput');
      const queryInput = document.getElementById('queryInput');
      const statusEl = document.getElementById('status');
      const rawResultEl = document.getElementById('rawResult');
      const resultHead = document.getElementById('resultHead');
      const resultBody = document.getElementById('resultBody');

      function setStatus(message, type) {
        statusEl.textContent = message;
        statusEl.className = 'status' + (type ? ' ' + type : '');
      }

      function prettyValue(value) {
        if (value === null || value === undefined) {
          return '';
        }

        if (typeof value === 'object') {
          return JSON.stringify(value);
        }

        return String(value);
      }

      function renderTable(columns, rows) {
        resultHead.textContent = '';
        resultBody.textContent = '';

        if (!columns.length) {
          return;
        }

        const headerRow = document.createElement('tr');
        for (const column of columns) {
          const th = document.createElement('th');
          th.textContent = column;
          headerRow.appendChild(th);
        }
        resultHead.appendChild(headerRow);

        for (const row of rows) {
          const tr = document.createElement('tr');
          for (const column of columns) {
            const td = document.createElement('td');
            td.textContent = prettyValue(row[column]);
            tr.appendChild(td);
          }
          resultBody.appendChild(tr);
        }
      }

      function getQueryToRun() {
        const start = queryInput.selectionStart;
        const end = queryInput.selectionEnd;
        if (typeof start === 'number' && typeof end === 'number' && end > start) {
          return queryInput.value.slice(start, end).trim();
        }

        return queryInput.value.trim();
      }

      async function runQuery() {
        const csl = getQueryToRun();
        if (!csl) {
          setStatus('Query is empty.', 'error');
          return;
        }

        runButton.disabled = true;
        setStatus('Running query...', '');

        try {
          const response = await fetch('/api/query', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              db: dbInput.value.trim() || undefined,
              csl,
            }),
          });

          const payload = await response.json();
          rawResultEl.textContent = JSON.stringify(payload, null, 2);

          if (!response.ok) {
            setStatus('Error: ' + (payload.error && payload.error.message ? payload.error.message : 'Request failed.'), 'error');
            renderTable([], []);
            return;
          }

          const columns = Array.isArray(payload.columns) ? payload.columns : [];
          const rows = Array.isArray(payload.rows) ? payload.rows : [];

          renderTable(columns, rows);
          setStatus('Success. Returned ' + rows.length + ' row(s).', 'success');
        } catch (error) {
          setStatus('Error: ' + (error && error.message ? error.message : 'Unknown error.'), 'error');
        } finally {
          runButton.disabled = false;
        }
      }

      runButton.addEventListener('click', runQuery);
      queryInput.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault();
          runQuery();
        }
      });
    </script>
  </body>
</html>`;
}