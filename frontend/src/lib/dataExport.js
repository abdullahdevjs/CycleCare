import { supabase } from "./supabase";

const TABLES = [
  ["profiles", "id"],
  ["cycle_profiles", "user_id"],
  ["cycle_history", "user_id"],
  ["daily_checkins", "user_id"],
  ["reminder_preferences", "user_id"],
];

export async function downloadUserData(user) {
  if (!user?.id) throw new Error("Missing authenticated user");

  const result = {
    exported_at: new Date().toISOString(),
    account: { id: user.id, email: user.email ?? null },
    data: {},
    unavailable: [],
  };

  for (const [table, column] of TABLES) {
    let data;
    let error;
    if (table === "profiles") {
      const profile = await supabase.rpc("get_my_profile");
      data = profile.data ? (Array.isArray(profile.data) ? profile.data : [profile.data]) : [];
      error = profile.error;
    } else if (table === "reminder_preferences") {
      const reminders = await supabase.rpc("get_my_reminder_preferences");
      data = reminders.data ? (Array.isArray(reminders.data) ? reminders.data : [reminders.data]) : [];
      error = reminders.error;
    } else {
      const response = await supabase.from(table).select("*").eq(column, user.id);
      data = response.data;
      error = response.error;
    }
    if (error) {
      console.warn(`CycleCare export: ${table} unavailable`, error);
      result.data[table] = [];
      result.unavailable.push(table);
      continue;
    }
    result.data[table] = data ?? [];
  }


  return { unavailable: result.unavailable, payload: { user, profile: result.data.profiles, cycleProfile: result.data.cycle_profiles, history: result.data.cycle_history, checkins: result.data.daily_checkins, reminders: result.data.reminder_preferences } };
}
