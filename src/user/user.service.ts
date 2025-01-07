import {
  BadRequestException,
  Injectable,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { User, UserDocument } from 'src/schemas/user.schema';
import { LoginUserDto } from 'src/dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { MessageResponse } from 'src/dto/message-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}
  async register(createUserDto: CreateUserDto): Promise<MessageResponse> {
    const { username, email, password } = createUserDto;
    const existingUser = await this.userModel.findOne({ username });
    const existingEmail = await this.userModel.findOne({ email });
    if (existingUser || existingEmail) {
      throw new BadRequestException('User already exist');
    }
    const hasPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      username,
      email,
      password: hasPassword,
    }).save();

    return new MessageResponse(201, 'Register successfully', newUser);
  }

  async findUserByUsernameOrEmail(identifier: string): Promise<User | null> {
    return this.userModel
      .findOne({
        $or: [{ username: identifier }, { email: identifier }],
      })
      .exec();
  }

  @Post('login')
  async loginUser(loginUserDto: LoginUserDto): Promise<MessageResponse> {
    const { identifier, password } = loginUserDto;

    const user = await this.findUserByUsernameOrEmail(identifier);
    const validPassword = await bcrypt.compare(password, user.password);
    if (!user) {
      throw new UnauthorizedException('Invalid username or email');
    }
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);
    return new MessageResponse(200, 'Login successfully', token);
  }
}
