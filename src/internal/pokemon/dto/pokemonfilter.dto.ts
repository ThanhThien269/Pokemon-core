import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

export class PokemonFilterDto {
  @IsNotEmpty()
  @Min(1)
  page = 1;

  @IsOptional()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsBoolean()
  legendary: boolean;
  @IsOptional()
  @IsInt()
  generation: number;
}
