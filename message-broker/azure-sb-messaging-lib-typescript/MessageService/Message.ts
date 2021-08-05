import { ObjectID } from "bson";
import { isInteger, toInteger, isEmpty } from "lodash";
import { IMessage } from "~/common/interface";
import { ClassType, transformAndValidateSync } from "class-transformer-validator";

export abstract class Message implements IMessage {
  public readonly $name: string;

  protected constructor() {
    this.$name = this.constructor.name;
    // this.$schema = schema;
    // this.$data = data;
    Object.defineProperty(this, "$name", {
      enumerable: false
    });
  }

  getEnvelope() {
    const result = {
      name: this.constructor.name,
      body: {} as any
    };

    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const metadata: MessageFieldMetadata = Reflect.getMetadata(
          messageFieldKey,
          this,
          key
        );

        if (!metadata) {
          continue;
        }

        result.body[key] = metadata.deserialize(this[key]);
      }
    }

    return result;
  }

  serialize() {
    const envelope = this.getEnvelope();
    return JSON.stringify(envelope, null, 4);
  }

  deserialize(v: any) {
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const metadata = Reflect.getMetadata(
          messageFieldKey,
          this,
          key
        ) as MessageFieldMetadata;

        if (metadata) {
          this[key] = metadata.deserialize(v[key]);
        }
      }
    }
  }
}

export const messageFieldKey = Symbol("MessageFieldKey");

export interface MessageFieldMetadata {
  name: string;
  serialize: (v: any) => any;
  deserialize: (v: any) => any;
}

export function ObjectIDField() {
  const meta: MessageFieldMetadata = {
    name: "ObjectID",
    serialize: v => v.toHexString(),
    deserialize: v => {
      if (!ObjectID.isValid(v)) {
        throw new Error("Invalid object id");
      }

      return new ObjectID(v);
    }
  };

  return Reflect.metadata(messageFieldKey, meta);
}

export function ObjectIDArrayField() {
  const meta: MessageFieldMetadata = {
    name: "ObjectIDArrayField",
    serialize: v => v.map(x => x.toHexString()),
    deserialize: v => {
      return isEmpty(v) ? [] : v.map(x => new ObjectID(x));
    }
  };

  return Reflect.metadata(messageFieldKey, meta);
}

export function ObjectField() {
  const meta: MessageFieldMetadata = {
    name: "JSONField",
    serialize: v => v,
    deserialize: v => v
  };

  return Reflect.metadata(messageFieldKey, meta);
}

export function StringField() {
  const meta: MessageFieldMetadata = {
    name: "string",
    serialize: v => v,
    deserialize: v => v.toString()
  };

  return Reflect.metadata(messageFieldKey, meta);
}

export function IntField() {
  const meta: MessageFieldMetadata = {
    name: "IntField",
    serialize: v => {
      if (!isInteger(v)) {
        throw new Error(`Invalid integer: ${v.toString()}`);
      }

      return v;
    },
    deserialize: v => toInteger(v)
  };

  return Reflect.metadata(messageFieldKey, meta);
}

export function StringArrayField() {
  const meta: MessageFieldMetadata = {
    name: "StringArrayField",
    serialize: v => v,
    deserialize: v => v
  };

  return Reflect.metadata(messageFieldKey, meta);
}

export function DateField() {
  const meta: MessageFieldMetadata = {
    name: "DateField",
    serialize: (v: Date) => v.valueOf(),
    deserialize: v => new Date(v)
  };

  return Reflect.metadata(messageFieldKey, meta);
}

export function BooleanField() {
  const meta: MessageFieldMetadata = {
    name: "BooleanField",
    serialize: v => v,
    deserialize: v => v
  };

  return Reflect.metadata(messageFieldKey, meta);
}
