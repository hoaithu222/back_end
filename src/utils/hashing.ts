import * as bcrypt from 'bcrypt';
const saltORRounds = 10;
export default class Hash {
  static make(password: string) {
    return bcrypt.hashSync(password, saltORRounds);
  }
  static verify(password: string, hash: string) {
    return bcrypt.compareSync(password, hash);
  }
}
