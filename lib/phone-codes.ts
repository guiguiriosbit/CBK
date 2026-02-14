/**
 * Códigos de país para teléfono/celular (formato internacional)
 */

export interface PhoneCode {
  code: string
  dialCode: string
  name: string
}

export const PHONE_CODES: PhoneCode[] = [
  { code: "MX", dialCode: "+52", name: "México" },
  { code: "US", dialCode: "+1", name: "Estados Unidos" },
  { code: "CA", dialCode: "+1", name: "Canadá" },
  { code: "AR", dialCode: "+54", name: "Argentina" },
  { code: "BR", dialCode: "+55", name: "Brasil" },
  { code: "CL", dialCode: "+56", name: "Chile" },
  { code: "CO", dialCode: "+57", name: "Colombia" },
  { code: "CR", dialCode: "+506", name: "Costa Rica" },
  { code: "EC", dialCode: "+593", name: "Ecuador" },
  { code: "ES", dialCode: "+34", name: "España" },
  { code: "GT", dialCode: "+502", name: "Guatemala" },
  { code: "HN", dialCode: "+504", name: "Honduras" },
  { code: "NI", dialCode: "+505", name: "Nicaragua" },
  { code: "PA", dialCode: "+507", name: "Panamá" },
  { code: "PE", dialCode: "+51", name: "Perú" },
  { code: "PR", dialCode: "+1", name: "Puerto Rico" },
  { code: "DO", dialCode: "+1", name: "Rep. Dominicana" },
  { code: "UY", dialCode: "+598", name: "Uruguay" },
  { code: "VE", dialCode: "+58", name: "Venezuela" },
  { code: "GB", dialCode: "+44", name: "Reino Unido" },
  { code: "FR", dialCode: "+33", name: "Francia" },
  { code: "DE", dialCode: "+49", name: "Alemania" },
  { code: "IT", dialCode: "+39", name: "Italia" },
  { code: "PT", dialCode: "+351", name: "Portugal" },
  { code: "AU", dialCode: "+61", name: "Australia" },
  { code: "JP", dialCode: "+81", name: "Japón" },
  { code: "CN", dialCode: "+86", name: "China" },
  { code: "IN", dialCode: "+91", name: "India" },
  { code: "SV", dialCode: "+503", name: "El Salvador" },
  { code: "BZ", dialCode: "+501", name: "Belice" },
  { code: "CU", dialCode: "+53", name: "Cuba" },
  { code: "BO", dialCode: "+591", name: "Bolivia" },
  { code: "PY", dialCode: "+595", name: "Paraguay" },
].sort((a, b) => a.name.localeCompare(b.name, "es"))

export function getDialCodeByCountryCode(countryCode: string): string {
  const found = PHONE_CODES.find((p) => p.code === countryCode)
  return found?.dialCode ?? "+52"
}
