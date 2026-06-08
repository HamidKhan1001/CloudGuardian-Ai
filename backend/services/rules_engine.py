def generate_recommendations(resources: list) -> tuple[list[str], float]:
    recommendations = []
    savings = 0.0
    for r in resources:
        if r['type'] == 'Compute' and r.get('cpu_util') is not None and r['cpu_util'] < 5 and r['status'] == 'running':
            recommendations.append(f"Terminate idle instance {r['id']}")
            savings += r['cost']
        elif r['type'] == 'Database' and r.get('cpu_util') is not None and r['cpu_util'] < 20:
            recommendations.append(f"Downsize underutilized RDS {r['id']}")
            savings += (r['cost'] * 0.5)
        elif r['type'] == 'Storage' and r['status'] == 'unattached':
            recommendations.append(f"Delete unattached EBS volume {r['id']}")
            savings += r['cost']
    return recommendations, savings
