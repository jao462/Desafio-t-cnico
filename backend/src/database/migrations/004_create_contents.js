exports.up = async function (knex) {
  await knex.schema.createTable('contents', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('module_id').notNullable().references('id').inTable('modules').onDelete('CASCADE');
    table.string('title', 180).notNullable();
    table.text('content').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
};
exports.down = async function (knex) { await knex.schema.dropTableIfExists('contents'); };
