import { pgTable, text, timestamp, doublePrecision, boolean, uniqueIndex, index, serial } from 'drizzle-orm/pg-core';

export const launches = pgTable(
  'launches',
  {
    launchId: text('launch_id').primaryKey(),
    mint: text('mint').notNull(),
    name: text('name').notNull(),
    ticker: text('ticker').notNull(),
    description: text('description').notNull().default(''),
    imageUri: text('image_uri'),
    bannerUri: text('banner_uri'),
    metadataUri: text('metadata_uri').notNull(),
    website: text('website'),
    twitter: text('twitter'),
    telegram: text('telegram'),
    creator: text('creator').notNull(),
    devBuySol: doublePrecision('dev_buy_sol').notNull().default(0),
    signature: text('signature'),
    status: text('status').notNull().default('building'),
    simulated: boolean('simulated').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('launches_mint_idx').on(t.mint), index('launches_created_idx').on(t.createdAt)],
);

export const waitlist = pgTable(
  'waitlist',
  {
    id: serial('id').primaryKey(),
    xHandle: text('x_handle').notNull(),
    wallet: text('wallet').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('waitlist_x_idx').on(t.xHandle), uniqueIndex('waitlist_wallet_idx').on(t.wallet)],
);
