export abstract class Message {
    public readonly $name: string;

    protected constructor() {
        this.$name = this.constructor.name;
        
        Object.defineProperty(this, "$name", {
            enumerable: false,
        });
    }

    getEnvelope() {
        const result = {
            name: this.constructor.name,
            body: {} as any,
        };

        for (const key in this) {
            if (this.hasOwnProperty(key)) {
                result.body[key] = this[key];
            }
        }

        return result;
    }

    serialize() {
        const envelope = this.getEnvelope();
        return JSON.stringify(envelope, null, 4);
    }

    deserialize(v: any) {
        Object.assign(this, v);
    }
}
