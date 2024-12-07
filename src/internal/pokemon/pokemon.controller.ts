import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../auth/decorator/customize';
import { createReadStream } from 'fs';
import * as csv from 'csv-parser';
@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importPokemon(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    console.log(file);
    const result = [];
    await new Promise((resolve, reject) => {
      createReadStream(file.path)
        .pipe(csv())
        .on('data', (row) => {
          result.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });
    await this.pokemonService.importCsv(result);
    return { message: 'Imported successfully' };
  }
  @Get()
  @Public()
  async getAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('type') type: string,
    @Query('legendary') legendary: boolean,
    @Query('generation') generation: number,
    @Query('name') name?: string,
  ) {
    return this.pokemonService.getAll(
      page,
      limit,
      type,
      legendary,
      generation,
      name,
    );
  }

  @Get(':id')
  async getPokemonById(@Param('id') id: string) {
    return this.pokemonService.getPokemonById(id);
  }

  @Get(':_id')
  async getPokemonByMid(@Param('_id') _id: string) {
    return this.pokemonService.getPokemonByMid(_id);
  }

  @Post(':pokemonId/favorite/:userId')
  async markFavorite(
    @Param('userId') userId: string,
    @Param('pokemonId') pokemonId: string,
  ) {
    return this.pokemonService.markFavorite(userId, pokemonId);
  }

  // API để bỏ đánh dấu Pokémon khỏi yêu thích
  @Delete(':pokemonId/favorite/:userId')
  async unmarkFavorite(
    @Param('userId') userId: string,
    @Param('pokemonId') pokemonId: string,
  ) {
    return this.pokemonService.unmarkFavorite(userId, pokemonId);
  }
  @Get('favorites/:userId')
  async getFavoritePokemons(
    @Param('userId') userId: string,
    @Query('page') page: number = 1, // Thiết lập mặc định cho page là 1
    @Query('limit') limit: number = 20, // Thiết lập mặc định cho limit là 20
  ) {
    // Gọi service để lấy danh sách Pokémon yêu thích của người dùng
    const favorites = await this.pokemonService.getUserFavoritePokemons(
      userId,
      page,
      limit,
    );

    return {
      message: 'Favorite Pokémon list fetched successfully',
      data: favorites.data,
      currentPage: page,
      totalPages: favorites.totalPages,
      totalCount: favorites.totalCount,
    };
  }
}
