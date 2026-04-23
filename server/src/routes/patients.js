import { Router } from 'express';
import { createGuidanceSchema, createPatientSchema } from '../schemas/patient.js';
import { createGuidanceRecord, createPatientWithReport, deletePatientById, getPatientById, listPatients } from '../services/patientService.js';
import { generateHealthGuidance } from '../services/aiService.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const patients = await listPatients();
    res.json({ data: patients });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const patient = await getPatientById(req.params.id);
    res.json({ data: patient });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = createPatientSchema.parse(req.body);
    const patient = await createPatientWithReport(payload);
    res.status(201).json({ data: patient });
  } catch (error) {
    next(error);
  }
});

router.post('/guidance', async (req, res, next) => {
  try {
    const payload = createGuidanceSchema.parse(req.body);
    const aiResult = await generateHealthGuidance(payload.payload);
    const record = await createGuidanceRecord({
      patientId: payload.patientId,
      reportId: payload.reportId,
      result: aiResult.parsed,
      rawResponse: aiResult.raw
    });

    res.status(201).json({
      data: {
        guidance: record,
        result: aiResult.parsed
      }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await deletePatientById(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
