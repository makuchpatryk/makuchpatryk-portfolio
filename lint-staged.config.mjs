// Pre-commit: lint + typecheck on staged files. CI stays the source of truth.
export default {
  '*.{ts,vue,mjs,cjs,js}': ['eslint --fix'],
  // vue-tsc cannot check single files, so the function form runs the whole-project check once (no file args)
  '*.{ts,vue}': () => 'pnpm typecheck'
}
