def bubble_sort(records, key, descending=False):
    """Manual O(n²) bubble sort. key: request_id, name, submitted, or release_date."""
    items = list(records)
    n = len(items)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            left = _get_value(items[j], key)
            right = _get_value(items[j + 1], key)
            left = "" if left is None else left
            right = "" if right is None else right
            should_swap = left < right if descending else left > right
            if should_swap:
                items[j], items[j + 1] = items[j + 1], items[j]
                swapped = True
        if not swapped:
            break
    return items


def _get_value(record, key):
    aliases = {
        "name": "requester_name",
        "submitted": "submitted_at",
    }
    return getattr(record, aliases.get(key, key), None)
