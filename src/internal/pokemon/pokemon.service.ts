import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from './schemas/pokemon.schema';
import { Model, Types } from 'mongoose';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Pokemon.name) private pokemonModel: Model<Pokemon>,
  ) {}

  async importCsv(pokemonData: any[]) {
    if (!pokemonData || pokemonData.length === 0) {
      throw new Error('No data to import');
    }

    const formattedData = pokemonData.map((row) => ({
      id: row.id,
      name: row.name,
      type1: row.type1,
      type2: row.type2,
      total: +row.total,
      hp: +row.hp,
      attack: +row.attack,
      defense: +row.defense,
      spAttack: +row.spAttack,
      spDefense: +row.spDefense,
      speed: +row.speed,
      generation: +row.generation,
      legendary: row.legendary === 'TRUE',
      image: row.image,
      ytbUrl: row.ytbUrl,
    }));

    // Lưu dữ liệu vào MongoDB
    await this.pokemonModel.insertMany(formattedData);
  }

  async getAll(
    page: number,
    limit: number,
    type: string,
    legendary: boolean,
    generation: number,
    name: string,
  ): Promise<any> {
    const skip = (page - 1) * limit;
    const query: any = {};

    // Áp dụng các điều kiện tìm kiếm nếu có
    if (type) {
      query.$or = [{ type1: type }, { type2: type }];
    }

    if (legendary !== undefined) {
      query.legendary = legendary;
    }

    if (generation) {
      query.generation = generation;
    }

    if (name) {
      query.name = { $regex: name, $options: 'i' }; // Tìm kiếm tên Pokémon không phân biệt chữ hoa/thường
    }
    // Lấy tổng số Pokémon thỏa mãn bộ lọc
    const total = await this.pokemonModel.countDocuments(query).exec();

    // Lấy dữ liệu với pagination và bộ lọc
    const posts = await this.pokemonModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      pokemons: posts,
      endPage: Math.ceil(total / limit), // Tính số trang cuối cùng
    };
  }
  // Lấy thông tin Pokémon theo _id của MongoDB
  async getPokemonByMid(id: string): Promise<Pokemon> {
    const pokemon = await this.pokemonModel.findById(id).exec();
    if (!pokemon) {
      throw new NotFoundException('Not found');
    }
    return pokemon;
  }
  // Lấy thông tin Pokémon theo id của Pokémon
  async getPokemonById(id: string): Promise<Pokemon> {
    const pokemon = await this.pokemonModel.findOne({ id }).exec();
    if (!pokemon) {
      throw new NotFoundException('Not found');
    }
    return pokemon;
  }

  async markFavorite(userId: string, pokemonId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Nếu Pokémon đã có trong danh sách yêu thích thì không thêm vào
    if (user.favoritePokemons.includes(pokemonId)) {
      throw new BadRequestException('Pokémon is already marked as favorite');
    }

    // Thêm Pokémon vào danh sách yêu thích
    user.favoritePokemons.push(pokemonId);
    await user.save();

    return user;
  }

  async unmarkFavorite(userId: string, pokemonId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Nếu Pokémon không có trong danh sách yêu thích thì không làm gì

    if (!user.favoritePokemons.includes(pokemonId)) {
      throw new BadRequestException('Pokémon is not marked as favorite');
    }

    // Xóa Pokémon khỏi danh sách yêu thích
    user.favoritePokemons = user.favoritePokemons.filter(
      (id) => id !== pokemonId,
    );
    await user.save();

    return user;
  }

  async getUserFavoritePokemons(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<any> {
    // Chuyển userId thành ObjectId
    const userObjectId = new Types.ObjectId(userId);

    // Tìm người dùng
    const user = await this.userModel.findById(userObjectId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra và xử lý giá trị page và limit hợp lý
    const skip = (page - 1) * limit;
    const totalCount = user.favoritePokemons.length;
    const totalPages = Math.ceil(totalCount / limit);

    // Lấy Pokémon yêu thích dựa trên ID
    const favoritePokemons = await this.pokemonModel
      .find({ id: { $in: user.favoritePokemons } }) // Tìm tất cả Pokémon trong danh sách yêu thích
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data: favoritePokemons,
      totalCount,
      totalPages,
    };
  }
}
