export declare abstract class Message {
    readonly $name: string;
    protected constructor();
    getEnvelope(): {
        name: string;
        body: any;
    };
    serialize(): string;
    deserialize(v: any): void;
}
//# sourceMappingURL=Message.d.ts.map