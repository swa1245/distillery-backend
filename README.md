# distiller-backend

Demo API for Distiller inward / outward screens. MongoDB only — not production-hardened.

## Setup

1. MongoDB running locally (or set `MONGODB_URI` in `.env`)
2. Install & run:

```bash
cd distiller-backend
npm install
npm run seed   # optional sample rows
npm run dev
```

Server: `http://localhost:5190`

## APIs

### Inward
| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/inward?date=&q=` | List |
| GET | `/api/inward/:id` | One |
| POST | `/api/inward` | Create (auto net weight) |
| PUT | `/api/inward/:id` | Update |
| DELETE | `/api/inward/:id` | Delete |

### Outward
| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/outward?section=&date=&q=` | `section`: ethanol \| ddgs \| co2 \| other |
| GET | `/api/outward/:id` | One |
| POST | `/api/outward` | Create (ethanol AA qty derived) |
| PUT | `/api/outward/:id` | Update |
| DELETE | `/api/outward/:id` | Delete |

### Milling
| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/milling?date=&q=` | List flour analysis rows |
| POST / PUT / DELETE | `/api/milling/:id` | CRUD |

### Liquefaction
| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/liquefaction?view=&date=&q=` | `view`: liquefaction \| hplcWater \| hplcSlurry |
| POST / PUT / DELETE | `/api/liquefaction/:id` | CRUD |

### Prefermenter
| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/prefermenter?view=&date=&q=` | `view`: culturing \| hplc |
| POST / PUT / DELETE | `/api/prefermenter/:id` | CRUD |

### Fermenter
| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/fermenter?view=&date=&q=` | `view`: fermentation \| hplc |
| POST / PUT / DELETE | `/api/fermenter/:id` | CRUD |

### Lab Sample Register
| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/lab-register` | List dates / sheet summaries |
| GET | `/api/lab-register?date=` or `/api/lab-register/:date` | One sheet by date |
| PUT | `/api/lab-register/:date` | Upsert full sheet (meta + 6 sections) |
| POST | `/api/lab-register` | Upsert (`body.date` required) |
| DELETE | `/api/lab-register/:date` | Delete sheet |

### Distillation Operating Parameters
| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/distillation-operating` | List dates / sheet summaries |
| GET | `/api/distillation-operating?full=1` | Full sheets (rows) |
| GET | `/api/distillation-operating?date=` or `/:date` | One sheet by date |
| PUT | `/api/distillation-operating/:date` | Upsert `{ date, rows[] }` |
| POST | `/api/distillation-operating` | Upsert (`body.date` required) |
| DELETE | `/api/distillation-operating/:date` | Delete sheet |

Row fields: `id`, `section` (A–G), `slNo`, `particulars`, `unit`, `target`, `actual`

### Auth
| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/auth/login` | `{ email, password }` → user + token |
| GET | `/api/auth/default` | Demo credentials hint |

Default seeded login: `admin@distilpro.com` / `admin123`

Health: `GET /health`
