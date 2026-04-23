import { z } from 'zod';

const nullableString = z.union([z.string(), z.null()]).optional();

export const createPatientSchema = z.object({
  patientCode: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1, '姓名不能为空'),
  gender: nullableString,
  age: nullableString,
  status: z.string().trim().min(1).optional(),
  statusText: nullableString,
  date: nullableString,
  score: z.number().int().nullable().optional(),
  sourceLabels: z.array(z.string()).optional(),
  reportData: z.record(z.any()),
  rawRecord: z.record(z.any()).optional()
});

export const updatePatientSchema = createPatientSchema.partial();

export const guidancePayloadSchema = z.object({
  patient: z.record(z.any()),
  compositeAssessment: z.record(z.any()).optional(),
  highlightMetrics: z.array(z.record(z.any())).optional(),
  sleep: z.record(z.any()).optional(),
  stress: z.record(z.any()).optional(),
  bodyComposition: z.record(z.any()).optional()
});

export const createGuidanceSchema = z.object({
  patientId: z.string().trim().min(1),
  reportId: z.string().trim().min(1).optional(),
  payload: guidancePayloadSchema
});
