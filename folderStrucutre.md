monorepo-root/
├── docker-compose.yml
├── README.md
├── backend/
│ ├── Dockerfile
│ ├── package.json
│ ├── src/
│ │ ├── index.ts
│ │ ├── routes/
│ │ │ └── dataRoutes.ts
│ │ ├── db/
│ │ │ └── client.ts
│ │ ├── services/
│ │ │ └── defiLlamaService.ts
│ │ └── jobs/
│ │ └── fetchDataJob.ts
│ ├── prisma/
│ │ └── schema.prisma
│ └── tsconfig.json
└── frontend/
├── Dockerfile
├── package.json
├── public/
├── src/
│ ├── App.tsx
│ ├── components/
│ │ ├── BasicInfo.tsx
│ │ ├── TimelineChart.tsx
│ │ └── SentimentAnalysis.tsx
│ ├── index.tsx
│ └── ...
└── tsconfig.json
