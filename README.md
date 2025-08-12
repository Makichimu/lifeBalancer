# lifeBalancer

Basic Express + Prisma backend for tracking workouts.

## Development

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```

### API

- `GET /api/sport/exercises`
- `POST /api/sport/workouts`
- `GET /api/sport/workouts`
- `GET /api/sport/progress/:exerciseId`
