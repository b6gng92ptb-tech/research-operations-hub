import { z } from 'zod';
export const requestSchema=z.object({
 title:z.string().trim().min(5).max(140),
 description:z.string().trim().min(10).max(3000),
 category:z.enum(['data','infrastructure','procurement','research']),
 priority:z.enum(['low','medium','high']).default('medium')
}).strict();
export {canTransition,canPerform} from './workflow.mjs';
export {STATES as allowedStatuses} from './workflow.mjs';
