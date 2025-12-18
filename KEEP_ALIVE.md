## Keep-alive / Warm-up

1. This project exposes `/api/health` (GET) which immediately returns `{ status: "ok" }`.
2. On Vercel, create a Cron Job (Dashboard → Cron Jobs) with that path (e.g. `https://<your-deployment>/api/health`) and trigger it every 5–10 minutes to keep the Server Functions warm. If your Vercel plan can't schedule cron jobs, use a free external monitor such as UptimeRobot (https://dashboard.uptimerobot.com/) pointing to the same endpoint.
3. Alternative: use any external scheduler (UptimeRobot, cron-job.org) to call the endpoint on the same cadence.
4. Keep the job lightweight: do not add extra fetches because the goal is to keep the lambda alive without triggering long-running work.
