import json
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone


def parse_date(value):
    return datetime.fromisoformat(value.replace('Z', '+00:00'))


def inside_period(value, filters):
    current = parse_date(value)
    start = datetime.fromisoformat(filters['startDate'] + 'T00:00:00+00:00')
    end = datetime.fromisoformat(filters['endDate'] + 'T23:59:59.999000+00:00')
    return start <= current <= end


def bucket_label(value, granularity):
    current = parse_date(value)
    if granularity == 'monthly':
        return current.strftime('%Y-%m')
    if granularity == 'weekly':
        year, week, _ = current.isocalendar()
        return f'{year}-S{week:02d}'
    return current.strftime('%d/%m')


def build_report(payload):
    dataset = payload['dataset']
    filters = payload['filters']
    domain = filters['domain']
    ad_users = dataset.get('adUsers', [])
    sei_tasks = dataset.get('seiTasks', [])
    audit_logs = dataset.get('auditLogs', [])
    ad_logs = [log for log in audit_logs if log.get('entityType') == 'AdUser']

    created_from_audit = sum(1 for log in ad_logs if log.get('action') == 'AD_USER_CREATED')
    ad_created = created_from_audit or sum(1 for user in ad_users if inside_period(user['createdAt'], filters))
    ad_updated = sum(1 for log in ad_logs if log.get('action') == 'AD_USER_UPDATED')
    ad_deactivated = sum(1 for log in ad_logs if log.get('action') == 'AD_USER_DEACTIVATED')
    ad_active = sum(1 for user in ad_users if user.get('isActive'))
    ad_inactive = len(ad_users) - ad_active
    sei_created = sum(1 for task in sei_tasks if task.get('action') == 'CREATE' and inside_period(task['createdAt'], filters))
    sei_updated = sum(1 for task in sei_tasks if task.get('action') == 'UPDATE' and inside_period(task['updatedAt'], filters))
    sei_active = sum(1 for task in sei_tasks if task.get('status') not in ('COMPLETED', 'CANCELED'))
    sei_inactive = len(sei_tasks) - sei_active

    if domain == 'SEI':
        created, updated, deactivated = sei_created, sei_updated, 0
        active, inactive, total = sei_active, sei_inactive, len(sei_tasks)
    elif domain == 'AD':
        created, updated, deactivated = ad_created, ad_updated, ad_deactivated
        active, inactive, total = ad_active, ad_inactive, len(ad_users)
    else:
        created, updated, deactivated = ad_created + sei_created, ad_updated + sei_updated, ad_deactivated
        active, inactive, total = ad_active + sei_active, ad_inactive + sei_inactive, len(ad_users) + len(sei_tasks)

    timeline = defaultdict(lambda: {'created': 0, 'updated': 0, 'deactivated': 0})

    def inc(value, key):
        label = bucket_label(value, filters['granularity'])
        timeline[label][key] += 1

    if domain != 'AD':
        for task in sei_tasks:
            if task.get('action') == 'CREATE':
                inc(task['createdAt'], 'created')
            else:
                inc(task['updatedAt'], 'updated')
    if domain != 'SEI':
        for log in ad_logs:
            action = log.get('action')
            if action == 'AD_USER_CREATED':
                inc(log['createdAt'], 'created')
            elif action == 'AD_USER_UPDATED':
                inc(log['createdAt'], 'updated')
            elif action == 'AD_USER_DEACTIVATED':
                inc(log['createdAt'], 'deactivated')

    sectors = Counter()
    if domain != 'SEI':
        for user in ad_users:
            sectors[user.get('sector') or user.get('profile') or 'Sem setor'] += 1
    if domain != 'AD':
        for task in sei_tasks:
            sectors[task.get('sector') or task.get('profile') or 'Sem setor'] += 1

    return {
        'generatedAt': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
        'generatedBy': 'python',
        'filters': filters,
        'totals': {
            'total': total,
            'active': active,
            'inactive': inactive,
            'created': created,
            'updated': updated,
            'deactivated': deactivated,
        },
        'bars': [
            {'label': 'Criados', 'value': created, 'color': '#19bce3'},
            {'label': 'Alterados', 'value': updated, 'color': '#dd5fd2'},
            {'label': 'Desativados', 'value': deactivated, 'color': '#fb7a21'},
        ],
        'donut': [
            {'label': 'Ativos', 'value': active, 'color': '#19bce3'},
            {'label': 'Inativos', 'value': inactive, 'color': '#fb7a21'},
        ],
        'timeline': [
            {'label': label, **values}
            for label, values in sorted(timeline.items())
        ][-12:],
        'sectors': [
            {'label': label, 'value': value}
            for label, value in sectors.most_common(5)
        ],
    }


if __name__ == '__main__':
    try:
        print(json.dumps(build_report(json.loads(sys.stdin.read())), ensure_ascii=False))
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)
