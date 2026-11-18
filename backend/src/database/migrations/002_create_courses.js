exports.up = async function (knex) {
  await knex.schema.createTable('courses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('code', 30).notNullable().unique();
    table.string('title', 180).notNullable();
    table.text('description');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
};
exports.down = async function (knex) { await knex.schema.dropTableIfExists('courses'); };
