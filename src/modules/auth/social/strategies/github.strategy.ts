import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.PORT_URL}/auth/social/github/callback`,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    const { emails, photos, displayName } = profile;

    // Phân tách displayName thành firstName và lastName
    const nameParts = displayName ? displayName.split(' ') : ['', ''];
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ') || '';

    const user = {
      email: emails[0].value,
      firstName: firstName,
      lastName: lastName,
      picture: photos?.[0]?.value || '',
      accessToken,
    };

    done(null, user);
  }
}
