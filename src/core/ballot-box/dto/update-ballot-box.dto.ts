import { PartialType } from '@nestjs/mapped-types';
import { CreateBallotBoxDto } from './create-ballot-box.dto';

export class UpdateBallotBoxDto extends PartialType(CreateBallotBoxDto) {
  public id: string;
  public session: string;
  public isBlocked: boolean;
}
