import { PresenceMember } from './';

describe('presence member', () => {
  it('should instantiate', async () => {
    const member = new PresenceMember('1', { name: 'John' });

    expect(member.user_id).toBe('1');
    expect(member.user_info).toEqual({ name: 'John' });
    expect(member.socket_id).toBeUndefined();
  });

  it('should instantiate from object', async () => {
    const member = PresenceMember.fromObject({
      user_id: '1',
      user_info: { name: 'John' },
      socket_id: '123',
    });

    expect(member.user_id).toBe('1');
    expect(member.user_info).toEqual({ name: 'John' });
    expect(member.socket_id).toBe('123');
  });

  it('should convert to object', async () => {
    const member = new PresenceMember('1', { name: 'John' });

    expect(member.toObject()).toEqual({
      user_id: '1',
      user_info: { name: 'John' },
    });
  });

  it('should convert to object with socket id', async () => {
    const member = new PresenceMember('1', { name: 'John' }, '123');

    expect(member.toObject()).toEqual({
      user_id: '1',
      user_info: { name: 'John' },
      socket_id: '123',
    });
  });
});
