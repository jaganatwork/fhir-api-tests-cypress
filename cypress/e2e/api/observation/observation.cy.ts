import { ObservationAPI } from '../../../support/api-utils';
import { Observation } from '../../../support/types/fhir'

describe('FHIR Observation API Tests', () => {
  let observationId: string;
  let observationPayload: Observation;

  before(() => {
    cy.fixture('observation/observation-request.json').then((data) => {
      observationPayload = data;
    });
  });

  it('Create Observation (POST)', () => {
    ObservationAPI.createObservation(observationPayload).then((response) => {
      expect(response.status).to.eq(201);
      observationId = response.body.id!;
      cy.log(`Created Observation ID: ${observationId}`);
    });
  });

  it('Get Observation (GET)', () => {
    ObservationAPI.getObservation(observationId).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.resourceType).to.eq('Observation');
    });
  });

  it('Update Observation (PUT)', () => {
    const updatedObservation: Observation = {
      ...observationPayload,
      id: observationId,
      status: 'amended',
      valueQuantity: { value: 130, unit: 'mmHg' }
    };

    ObservationAPI.updateObservation(observationId, updatedObservation).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq('amended');
    });
  });

  it('Delete Observation (DELETE)', () => {
    ObservationAPI.deleteObservation(observationId).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
