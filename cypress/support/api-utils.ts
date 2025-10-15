import { Observation, Medication} from "./types/fhir";

const BASE_URL = `${Cypress.config('baseUrl')}`;

export class ObservationAPI {
  static createObservation(observation: Observation) {
    return cy.request<Observation>({
      method: 'POST',
      url: `${BASE_URL}/Observation`,
      body: observation,
      headers: { 'Content-Type': 'application/fhir+json' }
    });
  }

  static getObservation(id: string) {
    return cy.request<Observation>(`${BASE_URL}/Observation/${id}`);
  }

  static updateObservation(id: string, observation: Observation) {
    return cy.request<Observation>({
      method: 'PUT',
      url: `${BASE_URL}/Observation/${id}`,
      body: { ...observation, id },
      headers: { 'Content-Type': 'application/fhir+json' }
    });
  }

  static deleteObservation(id: string) {
    return cy.request({
      method: 'DELETE',
      url: `${BASE_URL}/Observation/${id}`,
    });
  }
}

export class MedicationAPI {
  static createMedication(medication: Medication) {
    return cy.request<Medication>({
      method: 'POST',
      url: `${BASE_URL}/Medication`,
      body: medication,
      headers: { 'Content-Type': 'application/fhir+json' }
    });
  }

  static getMedication(id: string) {
    return cy.request<Medication>(`${BASE_URL}/Medication/${id}`);
  }

  static updateMedication(id: string, medication: Medication) {
    return cy.request<Medication>({
      method: 'PUT',
      url: `${BASE_URL}/Medication/${id}`,
      body: { ...medication, id },
      headers: { 'Content-Type': 'application/fhir+json' }
    });
  }

  static deleteMedication(id: string) {
    return cy.request({
      method: 'DELETE',
      url: `${BASE_URL}/Medication/${id}`
    });
  }
}