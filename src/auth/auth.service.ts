import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { User } from "../schemas/user.schema";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  generateJwtToken(user: User): string {
    const payload = {
      sub: user._id,
      userId: user._id.toString(),
      googleId: user.googleId,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }
  async validateGoogleUser(googleUser: {
    googleId: string;
    email: string;
    name: string;
    picture?: string;
  }): Promise<User> {
    // Check if user exists
    try {
      const existingUser = await this.usersService.findByGoogleId(
        googleUser.googleId,
      );

      // Update last login
      await this.usersService.updateLastLogin(existingUser._id.toString());

      return existingUser;
    } catch (error) {
      // User doesn't exist, create new one
      const newUser = await this.usersService.create({
        googleId: googleUser.googleId,
        email: googleUser.email,
        name: googleUser.name,
      });

      return newUser;
    }
  }

  async login(user: User) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      googleId: user.googleId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        gold: user.gold,
        totalEarnings: user.totalEarnings,
        totalTreesSold: user.totalTreesSold,
      },
    };
  }

  async validateToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.usersService.findOne(decoded.sub);
      return user;
    } catch (error) {
      return null;
    }
  }
}
