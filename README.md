# GiftGenius AI — Smart AI-Powered Gift Shop

A full-stack e-commerce platform that helps users discover the perfect gift using
an AI-style recommendation engine based on recipient age, gender, relationship,
occasion and budget.

- **Frontend:** React 19 (Vite), React Router DOM, Axios, Tailwind CSS v4, Framer Motion, React Icons, React Hot Toast
- **Backend:** Django 6, Django REST Framework, SQLite, SimpleJWT, django-cors-headers, django-filter

## Project Structure

```
eCommerce/
├── backend/                 # Django project
│   ├── config/               # settings.py, urls.py
│   ├── users/                 # custom User model, auth, profile
│   ├── products/              # Category, Product, AI seed data
│   ├── cart/                  # CartItem
│   ├── wishlist/              # WishlistItem
│   ├── orders/                # Order, OrderItem, checkout
│   ├── reminders/             # birthday/anniversary reminders
│   ├── recommendations/       # rule-based AI Gift Finder engine
│   └── manage.py
├── frontend/                 # React (Vite) app
│   └── src/
│       ├── components/        # Navbar, Footer, ProductCard, ui/, admin/
│       ├── pages/              # Landing, Products, GiftFinder, Cart, Dashboard, admin/...
│       ├── layouts/            # MainLayout, DashboardLayout, AdminLayout
│       ├── context/            # AuthContext, CartContext, WishlistContext
│       ├── services/           # axios API clients
│       ├── hooks/               # useDebounce
│       └── routes/              # ProtectedRoute, AdminRoute
└── backend_venv/             # Python virtual environment (gitignored)
```

## Backend Setup

```bash
cd eCommerce
python -m venv backend_venv

# Activate the virtual environment
backend_venv\Scripts\activate        # Windows
source backend_venv/bin/activate     # macOS/Linux

cd backend
pip install django djangorestframework djangorestframework-simplejwt \
            django-cors-headers django-filter Pillow

python manage.py makemigrations
python manage.py migrate
python manage.py seed_data      # creates categories, 48 demo products, demo users
python manage.py runserver 8000
```

The API will be available at `http://127.0.0.1:8000/api/`. The Django admin is at
`http://127.0.0.1:8000/admin/`.

### Seeded accounts

| Role   | Username | Password   |
|--------|----------|------------|
| Admin  | `admin`  | `Admin@123` |
| Demo user | `demo` | `Demo@123` |

Re-run `python manage.py seed_data` any time to reset demo data (it clears
existing products/orders/reminders first).

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and expects the API at
`http://127.0.0.1:8000/api` (configured via `frontend/.env` → `VITE_API_URL`).

## Key API Endpoints

| Endpoint | Description |
|---|---|
| `POST /api/users/register/` | Create account, returns JWT pair |
| `POST /api/users/login/` | Login, returns JWT pair |
| `GET/PATCH /api/users/profile/` | View/update profile |
| `POST /api/users/change-password/` | Change password |
| `GET /api/products/` | List/search/filter/sort products |
| `GET /api/products/categories/` | List categories |
| `GET /api/products/trending/` / `/featured/` | Curated lists |
| `GET /api/products/stats/` | Admin sales stats |
| `GET/POST /api/cart/` | View/add to cart |
| `GET/POST /api/wishlist/` | View/add to wishlist |
| `POST /api/orders/checkout/` | Convert cart into an order |
| `GET /api/orders/` | Order history (`?all=true` for admins) |
| `GET/POST /api/reminders/` | Birthday/anniversary reminders |
| `POST /api/recommendations/gift-finder/` | AI Gift Finder recommendations |

## AI Gift Finder

`backend/recommendations/engine.py` implements a deterministic, rule-based
scoring engine (no external API required) that ranks products by:

- Budget fit
- Age range fit
- Gender fit
- Occasion fit (exact match + category-occasion associations)
- Relationship fit (category associations, e.g. partner → jewelry/flowers)
- Trending/rating tie-breakers

Each recommendation includes a list of plain-English reasons explaining why it
was suggested, satisfying the brief's example: Age 20–30, Female, Birthday,
KSh 3,000–5,000 → Jewelry, Flowers, Personalized Mug, Gift Box.

## Run with Docker

A `docker-compose.yml` is provided at the repo root to spin up Postgres,
the Django backend, and the Vite frontend together:

```bash
docker compose up --build
```

This starts:
- **db** — Postgres 17, host port `5433`
- **backend** — Django, host port `8000` (runs migrations automatically on start)
- **frontend** — Vite dev server, host port `5180`

Note: `db` publishes to host port `5433`. If you already have a Postgres
container manually running on that port (e.g. from local development outside
Docker Compose), stop it first with `docker stop <container>` or Compose's
`db` service will fail to bind the port.

## Notes

- Cart works for guests via `localStorage` and automatically syncs to the
  backend once a user logs in.
- Checkout supports Cash on Delivery and an M-Pesa placeholder (no real
  payment gateway is integrated).
- Product images use seeded placeholder URLs (`picsum.photos`) for demo
  purposes; the `Product.image` file field is also supported for real uploads
  via the Django admin or Admin Dashboard.
