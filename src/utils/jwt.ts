import * as jwt from 'jsonwebtoken';
export default class JWT {
  static createAccessToken(payload: object) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE || '24h',
    });
  }
  static createRefreshToken() {
    const payload = {
      value: Math.random() + new Date().getTime(),
    };
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRE || '72h',
    });
  }
  static verifyAccessToken(accessToken: string) {
    try {
      return jwt.verify(accessToken, process.env.JWT_SECRET);
    } catch (error) {
      return error;
    }
  }
}
