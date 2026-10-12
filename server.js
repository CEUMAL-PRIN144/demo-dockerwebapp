// A tiny "Team Lunch Menu" website with zero dependencies.
//
// The catch: it uses Object.groupBy(), which only exists in Node.js 21+.
// On a developer laptop with a recent Node it works perfectly.
// On a server still running Node 18 it blows up — "it works on my machine!"

const http = require("node:http");
const os = require("node:os");

const PORT = process.env.PORT || 3000;

const menu = [
  { name: "Margherita Pizza", category: "Mains", price: 9.5 },
  { name: "Chicken Adobo", category: "Mains", price: 8.0 },
  { name: "Caesar Salad", category: "Starters", price: 6.0 },
  { name: "Garlic Bread", category: "Starters", price: 4.0 },
  { name: "Halo-Halo", category: "Desserts", price: 5.5 },
  { name: "Tiramisu", category: "Desserts", price: 6.5 },
];

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function runtimeInfo() {
  return `
    <ul class="runtime">
      <li><b>Node.js:</b> ${process.version}</li>
      <li><b>OS:</b> ${os.type()} ${os.release()} (${process.arch})</li>
      <li><b>Hostname:</b> ${os.hostname()}</li>
    </ul>`;
}

function page(title, body, ok) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 2rem auto; padding: 0 1rem;
           background: ${ok ? "#f0fdf4" : "#fef2f2"}; color: #1f2937; }
    h1 { color: ${ok ? "#15803d" : "#b91c1c"}; }
    h2 { margin-bottom: .25rem; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: .3rem 0; border-bottom: 1px solid #e5e7eb; }
    td:last-child { text-align: right; }
    pre { background: #1f2937; color: #fca5a5; padding: 1rem; overflow-x: auto; border-radius: 6px; }
    .runtime { background: #fff; border: 1px solid #d1d5db; border-radius: 6px; padding: .75rem 1.5rem; }
  </style>
</head>
<body>
${body}
<h3>Running on</h3>
${runtimeInfo()}
</body>
</html>`;
}

function renderMenu() {
  // Object.groupBy is new in Node.js 21. This is the line that breaks on older servers.
  const byCategory = Object.groupBy(menu, (item) => item.category);

  const sections = Object.entries(byCategory)
    .map(
      ([category, items]) => `
      <h2>${category}</h2>
      <table>
        ${items.map((i) => `<tr><td>${i.name}</td><td>$${i.price.toFixed(2)}</td></tr>`).join("")}
      </table>`
    )
    .join("");

  return page("Team Lunch Menu", `<h1>🍽️ Team Lunch Menu</h1>${sections}`, true);
}

const server = http.createServer((req, res) => {
  try {
    const html = renderMenu();
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      page(
        "500 - Server Error",
        `<h1>💥 500 – Something broke</h1>
         <p>But it works on my machine…</p>
         <pre>${escapeHtml(err.stack)}</pre>`,
        false
      )
    );
  }
});

server.listen(PORT, () => {
  console.log(`Lunch menu running on http://localhost:${PORT} (Node ${process.version})`);
});
