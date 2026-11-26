class FIFOQueue:
    """Manual linked-list-free FIFO queue for pending document requests."""

    def __init__(self):
        self._items = []

    def enqueue(self, item):
        self._items.append(item)

    def dequeue(self):
        if self.is_empty():
            return None
        item = self._items[0]
        del self._items[0]
        return item

    def peek(self):
        return None if self.is_empty() else self._items[0]

    def is_empty(self):
        return len(self._items) == 0

    def size(self):
        return len(self._items)

    def all(self):
        return list(self._items)
