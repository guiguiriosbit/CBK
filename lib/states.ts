/**
 * Estados, provincias y territorios por país
 * Datos oficiales para formularios de dirección
 */

export interface StateOrTerritory {
  code: string
  name: string
}

/** 32 estados de México + CDMX */
export const MEXICO_STATES: StateOrTerritory[] = [
  { code: "AGU", name: "Aguascalientes" },
  { code: "BCN", name: "Baja California" },
  { code: "BCS", name: "Baja California Sur" },
  { code: "CAM", name: "Campeche" },
  { code: "CHP", name: "Chiapas" },
  { code: "CHH", name: "Chihuahua" },
  { code: "CDMX", name: "Ciudad de México" },
  { code: "COA", name: "Coahuila" },
  { code: "COL", name: "Colima" },
  { code: "DUR", name: "Durango" },
  { code: "GUA", name: "Guanajuato" },
  { code: "GRO", name: "Guerrero" },
  { code: "HID", name: "Hidalgo" },
  { code: "JAL", name: "Jalisco" },
  { code: "MEX", name: "Estado de México" },
  { code: "MIC", name: "Michoacán" },
  { code: "MOR", name: "Morelos" },
  { code: "NAY", name: "Nayarit" },
  { code: "NLE", name: "Nuevo León" },
  { code: "OAX", name: "Oaxaca" },
  { code: "PUE", name: "Puebla" },
  { code: "QUE", name: "Querétaro" },
  { code: "ROO", name: "Quintana Roo" },
  { code: "SLP", name: "San Luis Potosí" },
  { code: "SIN", name: "Sinaloa" },
  { code: "SON", name: "Sonora" },
  { code: "TAB", name: "Tabasco" },
  { code: "TAM", name: "Tamaulipas" },
  { code: "TLA", name: "Tlaxcala" },
  { code: "VER", name: "Veracruz" },
  { code: "YUC", name: "Yucatán" },
  { code: "ZAC", name: "Zacatecas" },
].sort((a, b) => a.name.localeCompare(b.name, "es"))

/** Estados y territorios de Estados Unidos */
export const US_STATES: StateOrTerritory[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "Distrito de Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawái" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Luisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Míchigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Misisipi" },
  { code: "MO", name: "Misuri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "Nuevo Hampshire" },
  { code: "NJ", name: "Nueva Jersey" },
  { code: "NM", name: "Nuevo México" },
  { code: "NY", name: "Nueva York" },
  { code: "NC", name: "Carolina del Norte" },
  { code: "ND", name: "Dakota del Norte" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregón" },
  { code: "PA", name: "Pensilvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "Carolina del Sur" },
  { code: "SD", name: "Dakota del Sur" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "Virginia Occidental" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "PR", name: "Puerto Rico" },
  { code: "VI", name: "Islas Vírgenes" },
  { code: "GU", name: "Guam" },
  { code: "AS", name: "Samoa Americana" },
  { code: "MP", name: "Islas Marianas del Norte" },
].sort((a, b) => a.name.localeCompare(b.name, "es"))

/** Provincias y territorios de Canadá */
export const CANADA_PROVINCES: StateOrTerritory[] = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "Columbia Británica" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "Nuevo Brunswick" },
  { code: "NL", name: "Terranova y Labrador" },
  { code: "NS", name: "Nueva Escocia" },
  { code: "NT", name: "Territorios del Noroeste" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Isla del Príncipe Eduardo" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukón" },
].sort((a, b) => a.name.localeCompare(b.name, "es"))

const STATES_BY_COUNTRY: Record<string, StateOrTerritory[]> = {
  MX: MEXICO_STATES,
  US: US_STATES,
  CA: CANADA_PROVINCES,
}

/**
 * Obtiene la lista de estados/territorios según el código de país ISO 3166-1
 * Para países sin lista predefinida, retorna vacío (usar campo de texto libre)
 */
export function getStatesByCountryCode(countryCode: string): StateOrTerritory[] {
  return STATES_BY_COUNTRY[countryCode.toUpperCase()] ?? []
}

/**
 * Indica si el país tiene selector de estados predefinido
 */
export function hasStatesSelector(countryCode: string): boolean {
  return countryCode.toUpperCase() in STATES_BY_COUNTRY
}
