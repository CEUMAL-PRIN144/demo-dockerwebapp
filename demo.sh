#!/usr/bin/env bash
# Walk through the "It works on my machine" demo.
#
#   ./demo.sh mine     Act 1 – run on YOUR machine with your local Node (needs Node 21+)  -> http://localhost:3000
#   ./demo.sh theirs   Act 2 – run on "the server" that has Node 18                       -> http://localhost:3001
#   ./demo.sh docker   Act 3 – build the Docker image and run it                           -> http://localhost:3002
#   ./demo.sh clean    Stop and remove the demo containers/image
set -euo pipefail
cd "$(dirname "$0")"

IMAGE=lunch-menu
case "${1:-}" in
  mine)
    echo "▶ Act 1: running with the Node.js installed on this machine ($(node --version))"
    echo "  Open http://localhost:3000 — works on my machine! 🎉"
    PORT=3000 node server.js
    ;;
  theirs)
    echo "▶ Act 2: running the SAME code on a 'server' with Node.js 18"
    echo "  Open http://localhost:3001 — 💥"
    docker run --rm --name lunch-theirs -p 3001:3000 \
      -v "$PWD":/app:ro -w /app node:18-alpine node server.js
    ;;
  docker)
    echo "▶ Act 3: package app + runtime into one image, run it anywhere"
    docker build -t "$IMAGE" .
    echo "  Open http://localhost:3002 — works on every machine ✅"
    docker run --rm --name lunch-docker -p 3002:3000 "$IMAGE"
    ;;
  clean)
    docker rm -f lunch-theirs lunch-docker 2>/dev/null || true
    docker rmi "$IMAGE" 2>/dev/null || true
    ;;
  *)
    sed -n '2,7p' "$0" | sed 's/^# \{0,1\}//'
    exit 1
    ;;
esac
