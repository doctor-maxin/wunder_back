export interface SignRequest {
  content: string;
  keyId: string;
  attrCertSerial?: string;
  description: string;
  documentType: DocumentTypes;
}

export interface SignResponse {
  container: string;
}

export interface SignKey {
  id: string;
  sessionOpened: boolean;
  cert: SignCert;
  attrCert: SignAttrCert;
}

export interface ValidateSignRequest {
  container: string;
}
export interface ValidateSignResponse {
  error: string;
  status: ValidateSignStatus;
  signatures: Signatures[];
}

export interface Signatures {
  status: SignatureStatus;
  error: string;
  signingDateTime: string;
  messageDigest: string;
  signerCertificateStatus: CertificateStatus;
  attributeCertificateStatus: AttributeCertificateStatus;
}

interface AttributeCertificateStatus {
  status: CertStatus;
  error: string;
  locality: string;
  region: string;
  address: string;
  organizationName: string;
  organizationalUnitName: string;
  professionName: string;
  serial: string;
  validSince: string;
  validUntil: string;
  upn: string;
  supn: string;
}
interface CertificateStatus {
  status: CertStatus;
  error: string;
  identityDocumentData: string;
  subjectName: SubjectName;
  serial: string;
  validSince: string;
  validUntil: string;
  upn: string;
}

interface SubjectName {
  surname: string;
  name: string;
  patronymic: string;
  countryName: string;
  organizationalUnitName: string;
  professionName: string;
  commonName: string;
  organizationName: string;
  streetAddress: string;
  localityName: string;
}

interface SignAttrCert {
  serial: string;
  validSince: string;
  validUntil: string;
  upn: string;
  organization: string;
  region: string;
  locality: string;
  address: string;
  supn: string;
}

interface SignCert {
  serial: string;
  validSince: string;
  validUntil: string;
  identityDocumentData: string;
  name: string;
  surname: string;
  upn: string;
  commonName: string;
  organization: string;
  country: string;
  locality: string;
  address: string;
  organizationalUnit: string;
  profession: string;
}

const enum SignatureStatus {
  VALID = 'VALID',
  FORMAT_INVALID = 'FORMAT_INVALID',
  DATA_CORRUPTED = 'DATA_CORRUPTED',
  CERTIFICATE_INVALID = 'CERTIFICATE_INVALID',
}

const enum CertStatus {
  CERTIFICATE_INVALID = 'CERTIFICATE_INVALID',
  VALID = 'VALID',
  FORMAT_INVALID = 'FORMAT_INVALID',
}

export const enum ValidateSignStatus {
  VALID = 'VALID',
  FORMAT_INVALID = 'FORMAT_INVALID',
  SIGNATURE_INVALID = 'SIGNATURE_INVALID',
}
export const enum DocumentTypes {
  BLRWBL = 'BLRWBL',
  BLRWBR = 'BLRWBR',
  BLRAPN = 'BLRAPN',
  BLRDLN = 'BLRDLN',
  BLRDNR = 'BLRDNR',
  BLRSPT = 'BLRSPT',
  BLRTORG2 = 'BLRTORG2',
  BLRRUSRENO = 'BLRRUSRENO',
  BLROAM = 'BLROAM',
  ORDERS = 'ORDERS',
  ORDRSP = 'ORDRSP',
  DESADV = 'DESADV',
  APERAK = 'APERAK',
  DELCAT = 'DELCAT',
  ROUTECAT = 'ROUTECAT',
  PRODCAT = 'PRODCAT',
  PARTIN = 'PARTIN',
  RECADV = 'RECADV',
  PRGCAT = 'PRGCAT',
  INVRPT = 'INVRPT',
  INVOICE = 'INVOICE',
  RETANN = 'RETANN',
  SLSRPT = 'SLSRPT',
  PDF = 'PDF',
  OFFER = 'OFFER',
  CANCEL = 'CANCEL',
  ROAMREQ = 'ROAMREQ',
  BLRADF = 'BLRADF',
  UPDDOPPR = 'UPDDOPPR',
  UPDDOPPOK = 'UPDDOPPOK',
  BLRDLNPR = 'BLRDLNPR',
  BLRDNRPOK = 'BLRDNRPOK',
  RUSRENO = 'RUSRENO',
  EDIBLRADF = 'EDIBLRADF',
  PRANNUL = 'PRANNUL',
}
