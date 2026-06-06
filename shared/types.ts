export type PropertyTypeEnum = 'maison' | 'appartement' | 'terrain' | 'local' | 'immeuble' | 'cave';
export type PropertyStatusEnum = 'a_vendre' | 'vendu' | 'sous_compromis';
export type DpeClassEnum = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface PropertyPhoto {
  id: string;
  propertyId: string;
  url: string;
  caption: string | null;
  position: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string | null;
  displayOrder: number;
}

export interface Property {
  id: string;
  slug: string;
  type: PropertyTypeEnum;
  title: string;
  city: string;
  price: number;
  status: PropertyStatusEnum;
  exclusive: boolean;
  description: string | null;
  features: string[];
  near: unknown[];
  beds: number | null;
  rooms: number | null;
  area: number | null;
  land: number | null;
  year: number | null;
  heat: string | null;
  dpeValue: number | null;
  dpeClass: DpeClassEnum | null;
  gesValue: number | null;
  gesClass: DpeClassEnum | null;
  energyCost: string | null;
  hasVideo: boolean;
  hasTour: boolean;
  agentId: string | null;
  createdAt: string;
  updatedAt: string;
  photos: PropertyPhoto[];
  agent: TeamMember | null;
}
