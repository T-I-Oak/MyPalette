import { readRect, readTransform, transformRect } from './geometry.js';

// A detached object still belongs to a pending transfer and cannot be placed manually.
const departing = new WeakSet();

export class MoveArea {
    #slots = new Map();
    #surface;
    #transform;
    #visible = true;
    #interactive = true;

    constructor(id, surface, transform = { x: 0, y: 0, scale: 1 }) {
        this.id = id;
        this.#surface = surface;
        this.#transform = readTransform(transform);
    }

    readTransform() {
        return this.#transform;
    }

    setTransform(transform) {
        this.#transform = readTransform(transform);
        this.render();
    }

    setPresentation({ visible = this.#visible, interactive = this.#interactive }) {
        this.#visible = visible;
        this.#interactive = interactive;
        this.render();
    }

    setSlot(id, localRect) {
        const rect = readRect(localRect);
        const slot = this.#slots.get(id);
        if (slot) {
            slot.rect = rect;
            if (slot.object) this.#renderSlot(slot);
        } else {
            this.#slots.set(id, { rect, object: null, reservation: null });
        }
    }

    deleteSlot(id) {
        const slot = this.#slots.get(id);
        if (!slot || slot.object || slot.reservation) return false;
        return this.#slots.delete(id);
    }

    place(object, id) {
        const slot = this.#slots.get(id);
        if (!slot || slot.object || slot.reservation || object.area || departing.has(object)) {
            return false;
        }
        this.#attach(slot, object);
        this.#renderSlot(slot);
        return true;
    }

    remove(object) {
        const slot = this.#findSlot(object);
        if (!slot || slot.reservation) return false;
        this.#detach(slot, object);
        return true;
    }

    render() {
        for (const slot of this.#slots.values()) {
            if (slot.object) this.#renderSlot(slot);
        }
    }

    renderObject(object) {
        const slot = this.#findSlot(object);
        if (slot) this.#renderSlot(slot);
    }

    reserveDeparture(object) {
        const slot = this.#findSlot(object);
        if (!slot || slot.reservation) return null;
        departing.add(object);
        return this.#reserve(slot, {
            detach: () => this.#detach(slot, object),
            restore: () => this.#attach(slot, object),
        }, () => departing.delete(object));
    }

    reserveArrival(object, id) {
        const slot = this.#slots.get(id);
        if (!slot || slot.object || slot.reservation) return null;
        return this.#reserve(slot, { attach: () => this.#attach(slot, object) });
    }

    #reserve(slot, operations, onRelease = () => {}) {
        const reservation = {
            ...operations,
            readLocalRect: () => slot.rect,
            release: () => {
                if (slot.reservation !== reservation) return;
                slot.reservation = null;
                onRelease();
            },
        };
        slot.reservation = reservation;
        return reservation;
    }

    #findSlot(object) {
        if (object.area !== this) return null;
        for (const slot of this.#slots.values()) {
            if (slot.object === object) return slot;
        }
        return null;
    }

    #attach(slot, object) {
        slot.object = object;
        object.setArea(this);
    }

    #detach(slot, object) {
        slot.object = null;
        object.setArea(null);
        this.#surface.removeFromArea(object, this);
    }

    #renderSlot({ object, rect }) {
        if (!this.#visible) {
            this.#surface.removeFromArea(object, this);
            return;
        }
        const viewport = this.#surface.readViewportTransform();
        const bounds = transformRect(transformRect(rect, this.#transform), viewport);
        const scale = this.#transform.scale * viewport.scale;
        this.#surface.renderInArea(object, bounds, this.#interactive && object.interactive, this, scale);
    }
}
