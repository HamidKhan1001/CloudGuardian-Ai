def predict_monthly_cost(daily_costs: list, days_in_month: int = 30) -> float:
    if not daily_costs:
        return 0.0
    days_passed = len(daily_costs)
    total_spend_so_far = sum([d['cost'] for d in daily_costs])
    recent_spend = sum([d['cost'] for d in daily_costs[-3:]])
    recent_daily_avg = recent_spend / 3 if len(daily_costs) >= 3 else total_spend_so_far / days_passed
    remaining_days = days_in_month - days_passed
    projected_total = total_spend_so_far + (recent_daily_avg * remaining_days)
    return round(projected_total, 2)
