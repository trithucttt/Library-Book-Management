import { IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  identifier: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
