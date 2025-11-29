import { CreateBallotBoxDto } from '../dto/create-ballot-box.dto';

export class BallotBox {
  public id: string;
  public session: string;
  public name: string;
  public isBlocked: boolean;

  public constructor(createBallotBox: CreateBallotBoxDto) {
    this.id = this.generateSimpleId();
    this.session = createBallotBox.session;
    this.name = createBallotBox.name;
    this.isBlocked = true;
  }

  private generateSimpleId(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++)
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    return result;
  }
}
