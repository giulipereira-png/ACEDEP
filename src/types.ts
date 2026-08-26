export interface NavItem {
  label: string;
  href: string;
}

export interface ImpactStat {
  id: string;
  number: string;
  label: string;
  description: string;
  iconName: string;
}

export interface Nucleo {
  id: string;
  name: string;
  fullName: string;
  type: string;
  address: string;
  neighborhood: string;
  city: string;
  description: string;
  highlights: string[];
  modalities: string[];
  schedule: string;
  badge: string;
  image: string;
  mapUrl: string;
}

export interface Modality {
  id: string;
  title: string;
  category: string;
  description: string;
  targetAudience: string;
  benefits: string[];
  features: string[];
  image: string;
}

export interface TeamMember {
  name: string;
  role: string;
  credentials: string;
  experience: string;
  image: string;
}

export interface AthleteStory {
  name: string;
  modality: string;
  category: string;
  achievement: string;
  quote: string;
  image: string;
}
