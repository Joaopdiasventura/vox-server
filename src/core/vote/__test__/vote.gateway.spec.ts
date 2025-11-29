import { VoteGateway } from '../vote.gateway';
import type { Vote } from '../entities/vote.entity';

describe('VoteGateway', () => {
  let gateway: VoteGateway;
  let emit: jest.Mock;

  beforeEach(() => {
    gateway = new VoteGateway();
    emit = jest.fn();
    (gateway as unknown as { server: { emit: jest.Mock } }).server = {
      emit,
    };
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should emit event on vote created', () => {
    const vote = { session: 'session-id' } as unknown as Vote;

    gateway.onVoteCreated(vote);

    expect(emit).toHaveBeenCalledWith('vote-session-id', vote);
  });
});
