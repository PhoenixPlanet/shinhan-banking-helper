class QNode<T> {
    public value: T;
    public next: QNode<T> | null;

    constructor(value: T) {
        this.value = value;
        this.next = null;
    }
}

export class Queue<T> {
    private _head: QNode<T> | null;
    private _tail: QNode<T> | null;
    private _size: number;

    constructor() {
        this._head = null;
        this._tail = null;
        this._size = 0;
    }

    enqueue(value: T) {
        const newNode = new QNode(value);
        if (this._tail) {
            this._tail.next = newNode;
        } else {
            this._head = newNode;
        }
        this._tail = newNode;
        this._size++;
    }

    front() {
        return this._head?.value;
    }

    dequeue() {
        if (!this._head) return null;
        const value = this._head.value;
        this._head = this._head.next;
        if (!this._head) this._tail = null;
        this._size--;
        return value;
    }

    get size() {
        return this._size;
    }

    isEmpty() {
        return this._size === 0;
    }

    clear() {
        this._head = null;
        this._tail = null;
        this._size = 0;
    }

    get_frist_n(n: number) {
        const result = [];
        let current = this._head;
        for (let i = 0; i < n && current; i++) {
            result.push(current.value);
            current = current.next;
        }
        return result;
    }
}