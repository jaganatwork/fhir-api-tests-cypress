export interface Quantity {
  value: number;
  unit: string;
}

export interface CodeableConcept {
  text: string;
}

export interface Reference {
  reference: string;
}

export interface Observation {
  resourceType: "Observation";
  id?: string;
  status: string;
  code: CodeableConcept;
  valueQuantity?: Quantity;
  subject: Reference;
}

export interface Medication {
  resourceType: "Medication";
  id?: string;
  code: CodeableConcept;
  status: string;
}