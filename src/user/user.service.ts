import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    console.log('=== User Service Debug ===');
    console.log('Searching for user with email:', email);

    try {
      // First, let's check if the email exists in the database
      const emailExists = await this.userRepository
        .createQueryBuilder('users')
        .select('users.email')
        .where('users.email = :email', { email })
        .getRawOne();

      console.log('Email exists check:', emailExists);

      // If email exists, get the full user data
      if (emailExists) {
        const user = await this.userRepository.findOne({
          where: { email },
          select: ['id', 'email', 'nama', 'password', 'createdAt', 'updatedAt'],
        });

        console.log('Full user data:', user);
        return user;
      }

      console.log('No user found with email:', email);
      return null;
    } catch (error) {
      console.error('Error in findByEmail:', error);
      return null;
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log('=== User Creation Debug ===');
    console.log('Input data:', createUserDto);

    try {
      // Check if user already exists
      const existingUser = await this.findByEmail(createUserDto.email);
      if (existingUser) {
        console.log('User already exists with email:', createUserDto.email);
        throw new Error('User already exists');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      console.log('Password hashed successfully');

      // Create user object
      const user = this.userRepository.create({
        email: createUserDto.email,
        nama: createUserDto.nama,
        password: hashedPassword,
      });
      console.log('User object created:', user);

      // Save to database
      const savedUser = await this.userRepository.save(user);
      console.log('User saved to database:', {
        id: savedUser.id,
        email: savedUser.email,
        nama: savedUser.nama,
        createdAt: savedUser.createdAt,
      });

      return savedUser;
    } catch (error) {
      console.error('Error in create method:', error);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'nama', 'createdAt', 'updatedAt'],
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'nama', 'createdAt', 'updatedAt'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    const data: Partial<User> = {};
    if (updateUserDto.email) data.email = updateUserDto.email;
    if (updateUserDto.nama) data.nama = updateUserDto.nama;
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    await this.userRepository.update(id, data);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
