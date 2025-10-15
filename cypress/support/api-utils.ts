import { Observation } from "./types/fhir";

const BASE_URL = `${Cypress.config('baseUrl')}/Observation`;

export class ObservationAPI {
  static createObservation(observation: Observation) {
    return cy.request<Observation>({
      method: 'POST',
      url: BASE_URL,
      body: observation,
      headers: { 'Content-Type': 'application/fhir+json' }
    });
  }

  static getObservation(id: string) {
    return cy.request<Observation>(`${BASE_URL}/${id}`);
  }

  static updateObservation(id: string, observation: Observation) {
    return cy.request<Observation>({
      method: 'PUT',
      url: `${BASE_URL}/${id}`,
      body: { ...observation, id },
      headers: { 'Content-Type': 'application/fhir+json' }
    });
  }

  static deleteObservation(id: string) {
    return cy.request({
      method: 'DELETE',
      url: `${BASE_URL}/${id}`
    });
  }
}
