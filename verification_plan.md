
# Verification Plan

## 1. Verify Split Button in Blueprint

- [ ] Open Blueprint App (localhost:3001)
- [ ] Navigate to Seed Inspection / "Quick Analyze"
- [ ] Confirm "Split Button" is visible with Deck Sprite and Stake Chip
- [ ] Test dropdown interactions (Deck Select, Stake Select)

## 2. Verify WASM Package Build (The "How It's Made" Part)

- The "Real" build pipeline is:
  1. **C# Source**: `Motely.WASM` (and `Orchestration`) compiled via `dotnet`
  2. **WASM Glue**: `Motely.TypeScript` bundles the output using `Vite`
  3. **NPM Package**: `motely-wasm` is the result of step 2.

- [ ] User can verify this by running `dotnet publish` in `Motely.WASM` and seeing the output in `bin/Release/.../publish`.
- [ ] User can see the bundling logic in `Motely.TypeScript/vite.config.ts`.

## 3. Verify Fixes

- [ ] `JamlUIV2` type error (`SearchedCount` array) is fixed.
- [ ] `motelyApi.ts` type error (`SearchResult` tallies) is fixed.
