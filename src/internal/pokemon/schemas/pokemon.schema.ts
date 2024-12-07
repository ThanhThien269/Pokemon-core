import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
export type PokemonDocument = HydratedDocument<Pokemon>;
@Schema({ timestamps: true })
export class Pokemon extends Document {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type1: string;

  @Prop()
  type2: string;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  hp: number;

  @Prop({ required: true })
  attack: number;

  @Prop({ required: true })
  defense: number;

  @Prop({ required: true })
  spAttack: number;

  @Prop({ required: true })
  spDefense: number;

  @Prop({ required: true })
  speed: number;

  @Prop({ required: true })
  generation: number;

  @Prop({ default: false })
  legendary: boolean;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  ytbUrl: string;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);
