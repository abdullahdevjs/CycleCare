# CycleCare final fix notes

- Log Period starts with both date and period length empty; user must explicitly choose them.
- Account Settings now preserves `cycle_profiles.last_period_date` when saving cycle preferences, preventing the NOT NULL error.
- Account Settings does not create an incomplete cycle profile before Cycle Setup has established a current-cycle anchor.
- Current cycle anchor is shown separately in Settings.
