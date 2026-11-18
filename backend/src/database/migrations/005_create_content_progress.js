exports.up = async function (knex) {
  await knex.schema.createTable('content_progress', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('content_id').notNullable().references('id').inTable('contents').onDelete('CASCADE');
    table.timestamp('watched_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.unique(['user_id', 'content_id']);
  });
};
exports.down = async function (knex) { await knex.schema.dropTableIfExists('content_progress'); };
