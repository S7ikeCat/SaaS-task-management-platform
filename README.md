# Task SaaS 🧠 — full-stack платформа управления проектами (Next.js + Prisma + PostgreSQL)

## 🌍 Production / Vercel

**Сайт в проде:**
https://task-saas-tan.vercel.app/login

Деплой выполнен на **Vercel**, приложение доступно по ссылке с любого устройства.

---

# 🚀 Деплой и инфраструктура

* **Hosting / Serverless:** Vercel (Next.js App Router)
* **Database:** PostgreSQL (Neon)
* **ORM:** Prisma
* **Auth:** NextAuth
* **Styling:** TailwindCSS
* **Frontend:** React + Next.js 16

---

# 🧠 Функциональность платформы

## 👤 Авторизация

Поддерживается полноценная система аккаунтов:

* регистрация пользователя
* вход в аккаунт
* защищённые страницы
* серверная проверка сессии

Если пользователь:

* **не авторизован** → редирект на `/login`
* **авторизован** → доступ к `/dashboard`

---

# 📊 Dashboard

После входа пользователь попадает в **Dashboard**, где отображается:

* количество пользователей
* количество проектов
* количество задач

Dashboard получает данные напрямую из базы данных через Prisma.

---

# 📁 Проекты

Пользователь может:

* создавать проекты
* просматривать список проектов
* добавлять участников
* управлять проектами

Каждый проект связан с владельцем и участниками.

---

# 📋 Задачи

Каждый проект может содержать задачи.

Функциональность задач:

* создание задачи
* назначение пользователя
* изменение статуса
* привязка к проекту

---

# 👥 Участники проекта

Система **Project Members** позволяет:

* добавлять пользователей в проект
* назначать роли
* управлять участниками

---

# 🧱 Архитектура проекта

```text
src/
 ├── app/
 │   ├── (auth)/
 │   │    ├── login
 │   │    └── register
 │   │
 │   ├── dashboard
 │   ├── projects
 │   ├── tasks
 │   └── page.tsx
 │
 ├── features/
 │   ├── auth
 │   ├── projects
 │   └── tasks
 │
 ├── shared/
 │   ├── db
 │   ├── lib
 │   └── ui
 │
prisma/
 ├── schema.prisma
 └── seed.ts
```

---

# 🗄 База данных

Основные таблицы:

* **User**
* **Project**
* **Task**
* **ProjectMember**

Связи:

```
User
 ├── Projects (owner)
 ├── Tasks
 └── ProjectMembers

Project
 ├── Tasks
 └── ProjectMembers

Task
 ├── Project
 └── Assigned User
```

ORM: **Prisma**

---

# ⚙️ Переменные окружения

Файл `.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE"

NEXTAUTH_SECRET="secret"
NEXTAUTH_URL="http://localhost:3000"
```

Production использует **Neon PostgreSQL**.

---

# 📦 Установка проекта

Клонировать репозиторий:

```bash
git clone https://github.com/S7ikeCat/SaaS-task-management-platform
cd SaaS-task-management-platform
```

Установить зависимости:

```bash
npm install
```

Сгенерировать Prisma Client:

```bash
npx prisma generate
```

Применить миграции:

```bash
npx prisma migrate dev
```

Запуск проекта:

```bash
npm run dev
```

---

# ☁️ Деплой

Проект задеплоен через **Vercel**.

Процесс деплоя:

1. Репозиторий загружается на GitHub
2. Импортируется в Vercel
3. Добавляются ENV переменные
4. Выполняется билд

Необходимые ENV для Vercel:

```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
```

---

# 🖼 Скриншоты

### Dashboard

![Dashboard](./screenshots/dashboard.png)

---

### Project

![Project](./screenshots/project.png)

---

# 📽️ Демо-видео (Updated) 🆕

https://www.loom.com/share/00728686bf0040069ab7f1a97df923d3

# 📽️ Демо-видео (Old)

https://www.loom.com/share/3a5799c5ed0b4a1c8caa8cb3f1a0361a

---

### ТЗ IRL

![IRL](./screenshots/Task-TZ.png)

---

### Оценка IRL

![assessment](./assessment.png)

---

# 📌 Дополнительная информация

* Prisma Client генерируется автоматически (`postinstall`)
* база данных размещена в **Neon**
* проект использует **Next.js App Router**
* backend и frontend работают в одном приложении

---

# ✅ Итог

Это полноценное full-stack SaaS приложение, включающее:

* систему авторизации
* управление проектами
* управление задачами
* работу с пользователями
* серверную архитектуру Next.js
* PostgreSQL + Prisma
* облачный деплой на Vercel

Production:
https://saa-s-task-management-platform.vercel.app
