import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { User } from "src/schemas/user.schema";

export type SummaryDocument = HydratedDocument<Summary> & { _id: string };

@Schema()
export class Summary {
  @Prop()
  name: string;

  @Prop()
  originalText: string;

  @Prop()
  summarisedText: string;

  @Prop({ type: "ObjectId", ref: "User", required: false })
  user: User & { _id: string };

  @Prop({ default: [] })
  tags: string[];

  // maybe like a private option?

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const SummarySchema = SchemaFactory.createForClass(Summary);
