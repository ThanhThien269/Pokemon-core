import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  codeId: string;

  @Prop()
  codeExpired: Date;

  @Prop({ type: [String], default: [] })
  favoritePokemons: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
