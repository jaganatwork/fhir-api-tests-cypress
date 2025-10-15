import { MedicationAPI } from '../../../support/api-utils';
import { Medication } from '../../../support/types/fhir';

describe('FHIR Medication API Tests', () => {
  let medicationId: string;
  let medicationPayload: Medication;

  before(() => {
    cy.fixture('medication/medication-request.json').then((data) => {
      medicationPayload = data;
    });
  });

  it('Create Medication (POST)', () => {
    MedicationAPI.createMedication(medicationPayload).then((response) => {
      expect(response.status).to.eq(201);
      medicationId = response.body.id!;
      cy.log(`Created Medication ID: ${medicationId}`);
    });
  });

  it('Get Medication (GET)', () => {
    MedicationAPI.getMedication(medicationId).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.resourceType).to.eq('Medication');
      expect(response.body.code.text).to.include('Aspirin');
    });
  });

  it('Update Medication (PUT)', () => {
    const updatedMedication: Medication = {
      ...medicationPayload,
      id: medicationId,
      code: { text: 'Aspirin 150mg Tablet' },
      status: 'active'
    };

    MedicationAPI.updateMedication(medicationId, updatedMedication).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.code.text).to.eq('Aspirin 150mg Tablet');
    });
  });

  it('Delete Medication (DELETE)', () => {
    MedicationAPI.deleteMedication(medicationId).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
