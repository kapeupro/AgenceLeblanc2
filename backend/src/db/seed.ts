import { db } from './client';
import { teamMembers, properties, adminUsers } from './schema';
import { hash } from 'bcryptjs';

// Team
const [fressard] = await db.insert(teamMembers).values([
  { name: 'Bruno FRESSARD', role: "Président de l'agence\net négociateur immobilier", displayOrder: 0 },
]).returning();
const [delmas] = await db.insert(teamMembers).values([
  { name: 'Arnault DELMAS', role: 'Négociateur immobilier', displayOrder: 1 },
]).returning();
const [gueffier] = await db.insert(teamMembers).values([
  { name: 'Florence GUEFFIER', role: 'Négociatrice immobilière', displayOrder: 2 },
]).returning();
await db.insert(teamMembers).values([
  { name: 'Emmanuelle HÉRY', role: 'Secrétaire', displayOrder: 3 },
]);

// Properties (9 annonces du prototype)
await db.insert(properties).values([
  {
    slug: 'pavillon-jardin', type: 'maison',
    title: 'Pavillon traditionnel avec grand jardin',
    city: 'À 11 minutes de Gournay-en-Bray',
    price: 21000000, status: 'a_vendre', exclusive: true,
    description: "Pavillon traditionnel offrant de beaux volumes, implanté sur un terrain clos et arboré de 620 m².",
    features: ['Garage attenant', 'Petit chalet de jardin', 'Chauffage central', 'Dépendance de 25 m²', 'Double vitrage en PVC', 'Gaz de ville'],
    near: [{ label: 'Centre ville', distance: '1,5 km' }, { label: 'Supermarché', distance: '0,6 km' }],
    beds: 4, rooms: 6, area: 92, land: 620, year: 1986,
    heat: 'Radiateurs électriques', dpeValue: 187, dpeClass: 'D', gesValue: 43, gesClass: 'D',
    energyCost: '1 290 €', hasVideo: true, hasTour: true, agentId: gueffier.id,
  },
  {
    slug: 'appart-balcon', type: 'appartement',
    title: 'Appartement avec balcon',
    city: 'À 11 minutes de Gournay-en-Bray',
    price: 21000000, status: 'a_vendre', exclusive: false,
    description: "Appartement traversant au cœur de Gisors, entièrement rénové.",
    features: ['Balcon 9 m²', 'Place de parking', 'Cuisine équipée', 'Double vitrage en PVC', 'Cave', 'Ascenseur'],
    near: [{ label: 'Centre ville', distance: '0,2 km' }, { label: 'Gare', distance: '0,4 km' }],
    beds: 2, rooms: 3, area: 52, year: 1998,
    heat: 'Chauffage collectif', dpeValue: 165, dpeClass: 'D', gesValue: 34, gesClass: 'C',
    energyCost: '980 €', hasVideo: true, hasTour: true, agentId: gueffier.id,
  },
  {
    slug: 'cave-centre', type: 'cave',
    title: 'Grande cave en centre-ville', city: 'Gisors',
    price: 21000000, status: 'a_vendre', exclusive: false,
    description: "Vaste cave voûtée en pierre située au cœur de Gisors.",
    features: ['Accès indépendant', 'Hauteur sous plafond confortable'],
    near: [{ label: 'Centre ville', distance: '20 m' }],
    rooms: 1, area: 292, year: 1947, heat: 'Aucun',
    hasVideo: false, hasTour: true, agentId: gueffier.id,
  },
  {
    slug: 'usage-mixte', type: 'immeuble',
    title: 'Ensemble immobilier à usage mixte',
    city: 'À 11 minutes de Gournay-en-Bray',
    price: 23000000, status: 'a_vendre', exclusive: false,
    description: "Ensemble immobilier à usage mixte composé d'un local commercial en rez-de-chaussée et d'un logement à l'étage.",
    features: ['Garage attenant', 'Chauffage central', 'Dépendance de 25 m²', 'Double vitrage en PVC', 'Gaz de ville'],
    near: [{ label: 'Centre ville', distance: '1,5 km' }],
    beds: 4, rooms: 6, area: 82, land: 620, year: 1907,
    heat: 'Chauffage central gaz', dpeValue: 187, dpeClass: 'D', gesValue: 43, gesClass: 'D',
    energyCost: '1 290 €', hasVideo: false, hasTour: true, agentId: delmas.id,
  },
  {
    slug: 'local-commercial', type: 'local',
    title: 'Local commercial en centre-ville', city: 'Gisors',
    price: 21000000, status: 'a_vendre', exclusive: false,
    description: "Local commercial de grande surface en centre-ville, en parfait état.",
    features: ['Garage attenant', 'Chauffage central', 'Double vitrage en PVC', 'Gaz de ville'],
    near: [{ label: 'Centre ville', distance: '10 m' }],
    rooms: 5, area: 292, land: 620, year: 1990,
    heat: 'Chauffage central', dpeValue: 187, dpeClass: 'D', gesValue: 43, gesClass: 'D',
    energyCost: '1 290 €', hasVideo: true, hasTour: true, agentId: gueffier.id,
  },
  {
    slug: 'terrain-village', type: 'terrain',
    title: 'Terrain dans charmant village', city: 'À 8 minutes de Gisors',
    price: 1500000, status: 'a_vendre', exclusive: true,
    description: "Terrain arboré au cœur d'un charmant village normand.",
    features: ['Terrain arboré', 'Au calme'],
    near: [{ label: 'Centre ville', distance: '1,5 km' }],
    land: 620, year: 1996, hasVideo: true, hasTour: false, agentId: fressard.id,
  },
  {
    slug: 'plain-pied', type: 'maison',
    title: 'Maison de plain-pied', city: 'Étrepagny',
    price: 25800000, status: 'a_vendre', exclusive: true,
    description: "Maison de plain-pied récente offrant un séjour lumineux, trois chambres.",
    features: ['Garage', 'Pompe à chaleur', 'Terrain clos', 'Double vitrage en PVC', 'Cellier'],
    near: [{ label: 'Centre ville', distance: '0,8 km' }, { label: 'École', distance: '0,3 km' }],
    beds: 3, rooms: 5, area: 95, land: 430, year: 2008,
    heat: 'Pompe à chaleur', dpeValue: 110, dpeClass: 'C', gesValue: 12, gesClass: 'A',
    energyCost: '760 €', hasVideo: false, hasTour: true, agentId: delmas.id,
  },
  {
    slug: 'familiale-campagne', type: 'maison',
    title: 'Maison familiale à la campagne', city: '9 km de Gisors',
    price: 35200000, status: 'a_vendre', exclusive: false,
    description: "Maison familiale spacieuse à la campagne, quatre chambres, double séjour.",
    features: ['Garage double', 'Cheminée', 'Dépendances', 'Jardin paysager', 'Buanderie'],
    near: [{ label: 'Centre ville', distance: '9 km' }],
    beds: 4, rooms: 7, area: 150, land: 460, year: 1975,
    heat: 'Chauffage central fioul', dpeValue: 210, dpeClass: 'E', gesValue: 48, gesClass: 'D',
    energyCost: '1 980 €', hasVideo: false, hasTour: true, agentId: gueffier.id,
  },
  {
    slug: 'maison-jardin', type: 'maison',
    title: 'Charmante maison avec grand jardin', city: 'Trie-de-Gournay',
    price: 21300000, status: 'a_vendre', exclusive: false,
    description: "Charmante maison de caractère avec son jardin clos de 610 m².",
    features: ['Garage', 'Cheminée', 'Jardin clos', 'Combles aménageables', 'Double vitrage'],
    near: [{ label: 'Centre ville', distance: '1 km' }, { label: 'École', distance: '0,6 km' }],
    beds: 3, rooms: 5, area: 90, land: 610, year: 1969,
    heat: 'Chauffage central gaz', dpeValue: 175, dpeClass: 'D', gesValue: 38, gesClass: 'D',
    energyCost: '1 320 €', hasVideo: false, hasTour: true, agentId: fressard.id,
  },
]);

// Admin user
await db.insert(adminUsers).values({
  email: process.env.ADMIN_EMAIL!,
  passwordHash: await hash(process.env.ADMIN_PASSWORD!, 10),
});

console.log('✅ Seed terminé');
process.exit(0);
