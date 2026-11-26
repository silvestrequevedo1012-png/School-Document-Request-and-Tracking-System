def linear_search_by_requester(records, name):
    """O(n) manual linear search by requester name."""
    result = []
    needle = name.strip().lower()
    for record in records:
        requester = getattr(record, "requester_name", "") or ""
        if needle in requester.lower():
            result.append(record)
    return result


def binary_search_by_request_id(sorted_records, request_id):
    """O(log n) binary search; records must be sorted by request_id."""
    low = 0
    high = len(sorted_records) - 1
    needle = request_id.strip().upper()
    while low <= high:
        mid = (low + high) // 2
        value = getattr(sorted_records[mid], "request_id", "")
        if value == needle:
            return sorted_records[mid]
        if value < needle:
            low = mid + 1
        else:
            high = mid - 1
    return None
