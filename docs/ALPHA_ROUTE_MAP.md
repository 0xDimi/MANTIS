# Alpha Route Map

## Public tester
- `/`
- `/markets`
- `/markets/[slug]`
- `/portfolio`
- `/profile`
- `/rules`

## Admin
- `/admin`
- `/admin/markets`
- `/admin/resolution`
- `/admin/users`

## Next implementation note
All market pricing, trade execution, resolution, and settlement stay server-side. Browser routes show data, request quotes, and confirm actions, but do not own final state.
