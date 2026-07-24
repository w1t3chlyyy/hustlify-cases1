# Hustlify — MiniApp кейсов для Telegram

Чёрно-белый MiniApp с кейсами (закрытыми заказами) сервиса. Главная → список кейсов →
кейс с галереей и кнопкой на проект. Управление кейсами — не через сайт, а командой
`/admin` в самом Telegram-боте (диалог с кнопками прямо в чате).
Данные — в Supabase, деплой — на Vercel.

## Стек
- Next.js 14 (App Router, TypeScript) — публичный MiniApp
- Tailwind CSS
- Framer Motion — анимации и свайп-галерея
- React Three Fiber / Three.js — 3D-фон (wireframe-объект + частицы)
- Supabase — база данных + хранилище изображений
- Telegram WebApp SDK — приветствие по имени, тема, кнопки-ссылки
- grammy — Telegram-бот с админ-панелью на команде `/admin` (webhook на Vercel)

## 1. Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com).
2. Откройте **SQL Editor → New query**, вставьте содержимое файла
   `supabase/schema.sql` и выполните. Это создаст таблицу `cases`,
   политики доступа (RLS) и публичный бакет `case-images` для фото.
3. В **Project Settings → API** возьмите:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` ключ → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` ключ → `SUPABASE_SERVICE_ROLE_KEY` (секретный, только для сервера)

## 2. Переменные окружения

Скопируйте `.env.local.example` в `.env.local` и заполните:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

TELEGRAM_BOT_TOKEN=токен-от-BotFather
ADMIN_TELEGRAM_IDS=123456789,987654321
TELEGRAM_WEBHOOK_SECRET=длинная-случайная-строка

NEXT_PUBLIC_BOT_URL=https://t.me/ваш_бот
NEXT_PUBLIC_SITE_URL=https://ваш-сайт.com
```

- `TELEGRAM_BOT_TOKEN` — токен бота от [@BotFather](https://t.me/BotFather) (`/newbot`).
- `ADMIN_TELEGRAM_IDS` — Telegram user id администраторов через запятую (без `@username`).
  Узнать свой id можно у бота [@userinfobot](https://t.me/userinfobot). Только эти id
  получат доступ к `/admin` — для всех остальных бот на эту команду просто промолчит.
- `TELEGRAM_WEBHOOK_SECRET` — случайная строка, которую Telegram будет присылать в
  заголовке запроса, чтобы отсечь чужие запросы на `/api/bot`. Сгенерировать:
```bash
openssl rand -hex 32
```

## 3. Локальный запуск

```bash
npm install
npm run dev
```

Откройте `http://localhost:3000` — главная страница, `/cases` — список кейсов.

Вебхук бота (`/api/bot`) требует публичный HTTPS-адрес, поэтому локально его так
просто не подёргать — тестируйте `/admin` уже после деплоя (шаги 4–5), либо
прокиньте `localhost:3000` наружу через [ngrok](https://ngrok.com) и временно
укажите этот адрес в `setWebhook`.

## 4. Деплой на Vercel

1. Залейте проект в GitHub-репозиторий.
2. На [vercel.com](https://vercel.com) → **Add New → Project** → выберите репозиторий.
3. Framework Preset определится автоматически как Next.js.
4. В **Environment Variables** добавьте все переменные из `.env.local`.
5. Нажмите **Deploy**. После сборки вы получите домен вида `https://hustlify.vercel.app`.

## 5. Подключение MiniApp и бота к Telegram

**Mini App (публичная часть):**
1. В **@BotFather**: `/newapp` (или `/myapps` → ваш бот → **Edit Menu Button / Web App**).
2. Укажите URL вашего Vercel-домена (`https://hustlify.vercel.app`).
3. В самом боте добавьте кнопку меню (Menu Button) или inline-кнопку с
   `web_app: { url: "https://hustlify.vercel.app" }` — тогда `Telegram.WebApp`
   отдаст приложению имя пользователя, тему и т. д.
4. `NEXT_PUBLIC_BOT_URL` в переменных окружения — это ссылка на самого бота
   (кнопка «Перейти в бота» внизу списка кейсов).

**Вебхук админ-бота:** после деплоя один раз зарегистрируйте адрес вебхука в Telegram —
подставьте свой токен, домен и секрет из `TELEGRAM_WEBHOOK_SECRET`:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d "url=https://hustlify.vercel.app/api/bot" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Проверить, что вебхук встал: `https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo`.

## 6. Админка — команда /admin в боте

Никакого сайта: администратор пишет боту `/admin` и получает меню с кнопками.

- **➕ Добавить кейс** — пошаговый мастер: заголовок → слаг (можно принять
  автоматический, сгенерированный транслитерацией заголовка, или ввести свой) →
  подзаголовок → описание → теги → ссылка на проект → обложка (фото) → галерея
  (несколько фото подряд, затем «Готово») → публикация сразу или черновик.
  Необязательные шаги можно пропускать кнопкой «⏭ Пропустить». Фото уходят в
  Supabase Storage, бакет `case-images`, так же как раньше.
- **📋 Список кейсов** — список с отметкой 🟢/⚪️ (опубликован/черновик), по тапу —
  карточка кейса с кнопками: изменить любое поле, добавить фото в галерею,
  опубликовать/скрыть, удалить (с подтверждением).
- Доступ ограничен списком `ADMIN_TELEGRAM_IDS` — на `/admin` от любого другого
  пользователя бот просто не отвечает.
- Состояние диалога (на каком шаге мастера находится админ) хранится в таблице
  `admin_bot_state` в Supabase — так вебхук на Vercel остаётся без внешнего
  состояния между сообщениями.

## Структура проекта

```
src/
  app/
    page.tsx                 — главная (приветствие + лого + кнопка)
    cases/page.tsx           — список кейсов
    cases/[slug]/page.tsx    — кейс: галерея, описание, кнопка на проект
    api/bot/route.ts         — вебхук Telegram-бота (единственная "админ"-точка входа)
  components/
    Background3D.tsx         — 3D-фон на Three.js
    Gallery.tsx              — свайп-галерея
    CaseCard.tsx, BottomLinks.tsx, ViewProjectButton.tsx
  lib/
    supabase.ts              — публичный клиент (браузер/чтение)
    supabaseAdmin.ts         — серверный клиент с service_role (запись)
    telegram.ts              — обёртка над Telegram.WebApp (для MiniApp)
    bot/
      bot.ts                 — создание экземпляра grammy Bot
      handlers.ts            — маршрутизация команд/кнопок/сообщений бота
      auth.ts                — проверка ADMIN_TELEGRAM_IDS
      state.ts                — FSM-состояние диалога (Supabase)
      caseService.ts          — CRUD кейсов + загрузка фото из Telegram в Storage
      addFlow.ts               — мастер добавления кейса
      editFlow.ts              — редактирование/удаление/публикация кейса
      keyboards.ts, format.ts  — inline-клавиатуры и форматирование сообщений
supabase/schema.sql          — SQL-схема: таблицы cases, admin_bot_state + storage
```

## Дизайн

Полностью монохромная палитра (без цветовых акцентов): фон `#0A0A0A`, текст `#F2F2F0`,
второстепенный текст `#8A8A8A`, разделители `#2A2A2A`. Шрифты: Space Grotesk (заголовки),
Inter (текст), JetBrains Mono (лейблы/номера кейсов). Фон — вращающийся wireframe-объект
и лёгкие частицы на Three.js, поверх — тонкий зерновой (grain) оверлей для фактуры.
