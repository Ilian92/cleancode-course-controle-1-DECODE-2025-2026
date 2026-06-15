# Analysis of the `fight()` method

## Issues identified

### 1. Deeply nested conditionals ("pyramid of doom")
The function wraps its entire logic in three nested `if` blocks (`hasInit → hasRound → !hasFought`). This pushes the real work far to the right and makes the function hard to read. Guard clauses (early returns on invalid conditions) would flatten this immediately.

### 2. Returns a mixed, untyped array
The return type `Array<number|boolean>` is opaque. Callers access values by position (`response[4]`), which is fragile and gives no indication of what each index means. A plain typed object (`{ playerHealth, enemyHealth, enemyWeapon, status }`) is self-documenting and safe to destructure.

### 3. Duplicated switch statement
The exact same weapon-to-damage logic is written twice, once for the player and once for the enemy. Any future weapon change must be applied in two places. Extracting a `calculateDamage(weapon)` helper eliminates the duplication entirely.

### 4. The switch itself is not clean
A `switch` on string names that grows with every new weapon is hard to maintain. A `Record<string, () => number>` lookup map is shorter, eliminates `break` statements, and makes it trivial to add or remove a weapon in one line.

### 5. Too many responsibilities in one function
The function validates game state, picks the enemy weapon, calculates damage for both sides, applies net damage, clamps health, and determines the winner. Each of those is a distinct concern. Extracting helpers (`pickRandomWeapon`, `calculateDamage`, `clampToZero`, `determineStatus`) makes each step testable in isolation and keeps `fight` itself short.

### 6. Six parameters, three of which are boolean guards
`hasInit`, `hasRound`, and `hasFought` are only used to validate pre-conditions. They are a sign that the function is being called to manage state it should not own. Replacing the three boolean flags with a single `GameStatus` string (handled in the caller) removes these parameters entirely.

### 7. Misleading comments
`// health cannot be negative` and `// check if the game is over` describe *what* the code does, which should be obvious from well-named code. `// reset weapon list so the enemy could play` is the only comment hinting at a non-obvious side effect — and that side effect (`weaponList = weapons`) has no business being inside a `fight` function in the first place.

### 8. `any` type for weapons
`playerWeapon: any` discards all type safety. A simple `Weapon` interface makes the shape explicit and lets the compiler catch misuse.

## Summary of fixes

| Issue | Fix |
|---|---|
| Nested conditionals | Guard clauses (early `throw`) |
| Mixed array return | Typed `FightResult` object |
| Duplicated switch | Extract `calculateDamage(weapon)` helper |
| Switch maintainability | Replace with `weaponDamage` lookup map |
| Long function | Extract `pickRandomWeapon`, `clampToZero`, `determineStatus` helpers |
| Boolean flag parameters | Single `GameStatus` union type owned by the caller |
| `any` types | `Weapon` interface |
| Side effects in `fight` | Remove `weaponList = weapons` from `fight` |
