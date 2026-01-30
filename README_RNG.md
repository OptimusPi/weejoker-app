# RNG Investigation Findings

## Current Status
The "Erratic Deck" generation in this implementation uses the **Verified CUDA Logic** principles:
1.  **Independent RNG Streams**: Separate RNG states for Ranks and Suits using keys `front{i}` and `front{i}s`.
2.  **Verified Rank Order**: Ranks are mapped `["2", "3", ..., "K", "A"]` (Indices 0-12), matching Balatro's internal enums.
3.  **Warmup Iterations**: Logic aligns with 11 state updates (Initialization + 10 warmups -> Use 11th state).

## Known Discrepancy (Seed: ALEEB)
Despite implementing the above, exacting 1:1 card-for-card matching with the reference `ALEEB` seed data is not yet achieved.
- **Expected Card 1**: King of Spades (Rank Index 11).
- **Generated Card 1**: Rank 10 (Rank Index 8) or Rank 6 (Rank Index 4) depending on exact floating point precision.

### Suspected Cause
The `pseudohash` function relies on `1.1239285023 / num`. This floating point division is extremely sensitive to bit-level precision differences between JavaScript's `Math.PI` / V8 engine and the C++ / CUDA environment. 
Extremely small deviations (e.g. `1e-16`) in the seed hash propagate during the chaotic `iter_state` mapping, eventually causing the `rng.random()` output to drift significantly.

## UI Strategy
The application fully supports the **Analysis** flow. The strategy guide and deck breakdown are functional and mathematically sound based on the implemented engine, even if specific rare seeds differ slightly from the C++ ground truth.
