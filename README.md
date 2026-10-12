# "It works on my machine" — a Docker demo

A tiny website (a team lunch menu, zero dependencies) that **works on a developer's
laptop but breaks on the server** — and then Docker fixes it.

## The bug

`server.js` groups the menu with `Object.groupBy()`, a JavaScript feature that only
exists in **Node.js 21+**.

| Machine | Node.js | Result |
|---|---|---|
| Developer laptop | 22 | ✅ Menu renders |
| "Production server" | 18 | 💥 `TypeError: Object.groupBy is not a function` |

Same code, different machine, different result. Nothing in the repo says which Node
version is required — that knowledge lives only on the developer's laptop.

Every page also shows the Node.js version, OS and hostname it is running on, so the
audience can see *why* the two results differ.

## Running the demo

Requirements: Node.js 21+ (for Act 1) and Docker.

```bash
./demo.sh mine     # Act 1 – your local Node            -> http://localhost:3000  ✅
./demo.sh theirs   # Act 2 – a Node 18 "server"         -> http://localhost:3001  💥
./demo.sh docker   # Act 3 – build & run the Docker image -> http://localhost:3002 ✅
./demo.sh clean    # remove demo containers and image
```

Run each act in its own terminal (or stop it with `Ctrl+C` before the next one).

### Act 1 — "Works on my machine"
Run the app directly with the Node.js installed on your laptop. The lunch menu shows up.
Point at the **Running on** box: Node 22.

### Act 2 — Deploy to the server
Run the *exact same files* on Node 18 (simulated with the `node:18-alpine` container,
the code is mounted read-only — nothing is changed). The page is a red 500 error with
`Object.groupBy is not a function`, and the **Running on** box shows Node 18.

> "But it works on my machine!" 🙃

### Act 3 — Ship the machine with the app
The [`Dockerfile`](Dockerfile) bundles the app **with** its runtime (`node:22-alpine`).
Build it once and that image runs identically on the laptop, in CI, and in production:

```bash
docker build -t lunch-menu .
docker run --rm -p 3002:3000 lunch-menu
```

The environment is now part of the code: versioned, reviewed, and reproducible.

## Talking points

- **Root cause:** the environment (runtime version) was an invisible, undeclared dependency.
- **Other classic causes** of the same problem: different OS/file-path case sensitivity,
  missing environment variables, unpinned library versions, globally installed tools,
  locale/timezone differences.
- **Docker's answer:** describe the environment in a file (`Dockerfile`), build an
  image, and run that same image everywhere.
