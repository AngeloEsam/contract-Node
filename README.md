# 🏗️ Contracting B2B System

A **Node.js + Express + MongoDB** based backend for managing **projects, contracts, partners, materials, and work confirmations** in a contracting business workflow.

---

## 🚀 Features

- **Authentication & Authorization**
  - User registration & login with JWT
  - Secure password hashing with bcryptjs

- **Project & Partner Management**
  - Create and manage projects
  - Partner profiles with image storage

- **Contracts & Workflows**
  - Contracts management
  - Main, Sub, and Work Items
  - Additions & Deductions handling
  - Work Confirmation system (normal, additions, deductions)

- **Templates & Estimations**
  - Contract templates
  - Estimator templates
  - Estimator management

- **Materials & Products**
  - Categories & Products APIs
  - Material database management

- **File Handling**
  - Upload & parse Excel files
  - Static file serving for:
    - `/excelFiles`
    - `/projectImages`
    - `/partnerImages`

- **Security & Middleware**
  - CORS with custom origins
  - Cookie parsing
  - Input validation
  - Multer for file uploads

---

## 🛠️ API Endpoints

### 🔐 Authentication
| Method | Endpoint              | Description   |
|--------|-----------------------|---------------|
| POST   | /api/auth/register    | Register user |
| POST   | /api/auth/login       | Login user    |

---

### 📂 Projects & Partners
| Method | Endpoint        | Description       |
|--------|----------------|-------------------|
| GET    | /api/projects  | Get projects      |
| POST   | /api/projects  | Create project    |
| GET    | /api/partners  | Get partners      |
| POST   | /api/partners  | Add partner       |

---

### 📑 Contracts & Work
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| POST   | /api/contracts        | Create contract    |
| GET    | /api/work             | Get work items     |
| POST   | /api/addition         | Add addition       |
| POST   | /api/deduction        | Add deduction      |
| POST   | /api/workConfirmation | Confirm work       |

---

### 🏗️ Materials & Products
| Method | Endpoint        | Description        |
|--------|----------------|--------------------|
| GET    | /api/materials  | Get materials      |
| GET    | /api/categories | Get categories     |
| GET    | /api/products  | Get products       |



## 🚀 Getting Started

### 📁 Clone the repository

```bash
git clone https://github.com/your-username/contracting-b2b.git
cd contracting-b2b
--

##  Run the app
npm install
npm start
