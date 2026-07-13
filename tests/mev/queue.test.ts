import { describe, expect, it } from 'vitest';
import { TaskQueue } from '@/mev/queue';

describe('TaskQueue', () => {
  it('nunca corre más de `concurrency` tareas a la vez', async () => {
    const q = new TaskQueue(2);
    let active = 0,
      maxActive = 0;
    const task = () =>
      q.run(async () => {
        active++;
        maxActive = Math.max(maxActive, active);
        await new Promise((r) => setTimeout(r, 20));
        active--;
      });
    await Promise.all(Array.from({ length: 6 }, task));
    expect(maxActive).toBeLessThanOrEqual(2);
  });
});
