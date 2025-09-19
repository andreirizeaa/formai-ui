// supabase/functions/revenuecat-webhook/index.ts
// @ts-ignore
import { createClient } from "npm:@supabase/supabase-js@2"
declare const Deno: any

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

const RC_SECRET = Deno.env.get("RC_WEBHOOK_SECRET")

// --- Helper: get Expo push token from user_notifications ---
async function getExpoPushTokenForUser(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("user_notifications")
    .select("expo_push_notification")
    .eq("user_id", userId)
    .maybeSingle()

  if (error || !data) return null
  return (data as any)?.expo_push_notification ?? null
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "GET") return new Response("ok", { status: 200 })
    if (req.method !== "POST") return new Response("method not allowed", { status: 405 })

    if (RC_SECRET) {
      const auth = req.headers.get("authorization")
      if (auth !== `Bearer ${RC_SECRET}`) {
        return new Response("unauthorized", { status: 401 })
      }
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") return new Response("bad request", { status: 400 })

    const evt = (body as any).event ?? {}
    const type = evt.type as string | undefined
    const period_type = evt.period_type as string | undefined
    const expiration_at_ms = evt.expiration_at_ms as number | string | undefined
    const event_timestamp_ms = evt.event_timestamp_ms as number | string | undefined
    const app_user_id = evt.app_user_id as string | undefined
    const cancel_reason = evt.cancel_reason as string | undefined

    // 1. Trial start → schedule reminder 24h before expiry
    if (type === "INITIAL_PURCHASE" && period_type === "TRIAL" && expiration_at_ms && app_user_id) {
      const expireMs = Number(expiration_at_ms)
      if (Number.isFinite(expireMs)) {
        const sendAt = new Date(expireMs - 24 * 60 * 60 * 1000)

        const token = await getExpoPushTokenForUser(app_user_id)
        if (token) {
          const { error } = await supabase.from("subscription_notifications_queue").insert({
            user_id: app_user_id,
            expo_push_token: token,
            payload: {
              type: "trial_reminder",
              title: "Your free trial is ending tomorrow.",
              body: "We'd appreciate if you could give us a review!",
              data: {
                action: "open_store_review"
              }
            },
            send_at: sendAt,
          })
          if (error) console.error("subscription_notifications_queue insert error:", error)
        }
      }
    }

    // 2. Renewal → schedule a thank-you push (10 minutes after event_timestamp)
    if (type === "RENEWAL" && period_type === "NORMAL" && app_user_id && event_timestamp_ms) {
      const eventMs = Number(event_timestamp_ms)
      if (Number.isFinite(eventMs)) {
        const sendAt = new Date(eventMs + 2 * 60 * 1000)

        const token = await getExpoPushTokenForUser(app_user_id)
        if (token) {
          const { error } = await supabase.from("subscription_notifications_queue").insert({
            user_id: app_user_id,
            expo_push_token: token,
            payload: {
              type: "renewal",
              title: "You're renewed to Form AI! 🥳",
              body: "Thanks for subscribing! You now have full access.",
            },
            send_at: sendAt,
          })
          if (error) console.error("subscription_notifications_queue insert error:", error)
        }
      }
    }

    // 3. Cancellation → schedule goodbye push (10 minutes after event_timestamp)
    if (type === "CANCELLATION" && app_user_id && event_timestamp_ms) {
      const eventMs = Number(event_timestamp_ms)
      if (Number.isFinite(eventMs)) {
        const sendAt = new Date(eventMs + 2 * 60 * 1000)

        const token = await getExpoPushTokenForUser(app_user_id)
        if (token) {
          const { error } = await supabase.from("subscription_notifications_queue").insert({
            user_id: app_user_id,
            expo_push_token: token,
            payload: {
              type: "cancellation",
              title: "We're sorry to see you go. 🙁",
              body: "Please let us know why you are cancelling so we can improve!",
              data: {
                action: "open_cancellation_email"
              },
              ...(cancel_reason ? { reason: cancel_reason } : {}),
            },
            send_at: sendAt,
          })
          if (error) console.error("subscription_notifications_queue insert error:", error)
        }
      }
    }

    // 4. Non-renewing purchase → schedule active push (2 minutes after purchase)
    if (type === "NON_RENEWING_PURCHASE" && app_user_id && event_timestamp_ms) {
      const eventMs = Number(event_timestamp_ms)
      if (Number.isFinite(eventMs)) {
        const sendAt = new Date(eventMs + 2 * 60 * 1000)

        const token = await getExpoPushTokenForUser(app_user_id)
        if (token) {
          const { error } = await supabase.from("subscription_notifications_queue").insert({
            user_id: app_user_id,
            expo_push_token: token,
            payload: {
              type: "non_renewing_purchase",
              title: "HD videos are actived! 🥳",
              body: "Your videos will now remain the same high quality as in your library!",
              product_id: evt.product_id,
            },
            send_at: sendAt,
          })
          if (error) console.error("subscription_notifications_queue insert error:", error)
        }
      }
    }

    // 5. Initial purchase (non-trial) → schedule welcome push (10 minutes after event_timestamp)
    if (type === "INITIAL_PURCHASE" && period_type !== "TRIAL" && app_user_id && event_timestamp_ms) {
      const eventMs = Number(event_timestamp_ms)
      if (Number.isFinite(eventMs)) {
        const sendAt = new Date(eventMs + 2 * 60 * 1000)

        const token = await getExpoPushTokenForUser(app_user_id)
        if (token) {
          const { error } = await supabase.from("subscription_notifications_queue").insert({
            user_id: app_user_id,
            expo_push_token: token,
            payload: {
              type: "initial_purchase",
              title: "Welcome to Form AI! 🥳",
              body: "Your subscription is now active.",
            },
            send_at: sendAt,
          })
          if (error) console.error("subscription_notifications_queue insert error:", error)
        }
      }
    }

    return new Response("ok", { status: 200 })
  } catch (e) {
    console.error("Webhook fatal:", e)
    return new Response("internal error", { status: 500 })
  }
})
