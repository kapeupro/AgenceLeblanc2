import {
  pgTable, uuid, text, integer, boolean, timestamp, pgEnum, jsonb
} from 'drizzle-orm/pg-core';

export const propertyTypeEnum = pgEnum('property_type',
  ['maison', 'appartement', 'terrain', 'local', 'immeuble', 'cave']);
export const propertyStatusEnum = pgEnum('property_status',
  ['a_vendre', 'vendu', 'sous_compromis']);
export const dpeClassEnum = pgEnum('dpe_class', ['A', 'B', 'C', 'D', 'E', 'F', 'G']);
export const contactIntentEnum = pgEnum('contact_intent', ['achat', 'vente']);

export const teamMembers = pgTable('team_members', {
  id:           uuid('id').defaultRandom().primaryKey(),
  name:         text('name').notNull(),
  role:         text('role').notNull(),
  photoUrl:     text('photo_url'),
  displayOrder: integer('display_order').notNull().default(0),
});

export const properties = pgTable('properties', {
  id:          uuid('id').defaultRandom().primaryKey(),
  slug:        text('slug').notNull().unique(),
  type:        propertyTypeEnum('type').notNull(),
  title:       text('title').notNull(),
  city:        text('city').notNull(),
  price:       integer('price').notNull(),
  status:      propertyStatusEnum('status').notNull().default('a_vendre'),
  exclusive:   boolean('exclusive').notNull().default(false),
  description: text('description'),
  features:    text('features').array().notNull().default([]),
  near:        jsonb('near').notNull().default([]),
  beds:        integer('beds'),
  rooms:       integer('rooms'),
  area:        integer('area'),
  land:        integer('land'),
  year:        integer('year'),
  heat:        text('heat'),
  dpeValue:    integer('dpe_value'),
  dpeClass:    dpeClassEnum('dpe_class'),
  gesValue:    integer('ges_value'),
  gesClass:    dpeClassEnum('ges_class'),
  energyCost:  text('energy_cost'),
  hasVideo:    boolean('has_video').notNull().default(false),
  hasTour:     boolean('has_tour').notNull().default(false),
  agentId:     uuid('agent_id').references(() => teamMembers.id, { onDelete: 'set null' }),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
});

export const propertyPhotos = pgTable('property_photos', {
  id:         uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  url:        text('url').notNull(),
  caption:    text('caption'),
  position:   integer('position').notNull().default(0),
});

export const adminUsers = pgTable('admin_users', {
  id:           uuid('id').defaultRandom().primaryKey(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
});

export const contactSubmissions = pgTable('contact_submissions', {
  id:        uuid('id').defaultRandom().primaryKey(),
  intent:    contactIntentEnum('intent').notNull(),
  name:      text('name').notNull(),
  email:     text('email').notNull(),
  phone:     text('phone'),
  message:   text('message').notNull(),
  read:      boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const siteSettings = pgTable('site_settings', {
  key:   text('key').primaryKey(),
  value: text('value').notNull().default(''),
});

export const alertSubscriptions = pgTable('alert_subscriptions', {
  id:        uuid('id').defaultRandom().primaryKey(),
  name:      text('name').notNull(),
  email:     text('email').notNull(),
  phone:     text('phone'),
  type:      text('type'),
  city:      text('city').notNull(),
  priceMax:  integer('price_max'),
  rooms:     integer('rooms'),
  beds:      integer('beds'),
  areaMin:   integer('area_min'),
  duration:  text('duration').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
