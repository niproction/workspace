# Quality Gates

> Run all gates locally before every push. Fix failures before continuing.

---

## This Project (Next.js + Vitest)

```bash
npm run lint     # ESLint — zero errors required
npm run build    # Next.js build — must succeed
npm test         # Vitest — all tests must pass
```

CI runs the same three commands automatically on every PR via `.github/workflows/ci.yml`.

---

## Gate Rules

- Run in order: lint → build → test
- A failing gate blocks the push — fix first, never skip
- If a failure requires changing the implementation approach → STOP and discuss with user
- If tests don't exist for new logic → add at least one unit test before pushing

---

## Generic Templates (other stacks)

**Node / Express**
```bash
npm run lint
npm run build
npm test
```

**Python / FastAPI**
```bash
ruff check .
mypy .
pytest
```

**Go**
```bash
go vet ./...
go build ./...
go test ./...
```

**Rust**
```bash
cargo clippy
cargo build --release
cargo test
```
