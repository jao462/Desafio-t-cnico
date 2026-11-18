exports.up = async function (knex) {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 120).notNullable();
    table.string('email', 180).notNullable().unique();
    table.string('status', 20).notNullable().defaultTo('active');
    table.checkIn('status', ['active', 'inactive']);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
};
exports.down = async function (knex) { await knex.schema.dropTableIfExists('users'); };
