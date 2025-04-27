
const db = require('../db');

// GET all sales with filters and pagination
exports.getAll = async (filters) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (filters.startDate) {
    conditions.push(`s.date >= $${idx++}`);
    values.push(filters.startDate);
  }
  if (filters.endDate) {
    conditions.push(`s.date <= $${idx++}`);
    values.push(filters.endDate);
  }
  if (filters.category) {
    conditions.push(`p.category_id = $${idx++}`);
    values.push(filters.category);
  }
  if (filters.salesUnit) {
    conditions.push(`s.sales_unit_id = $${idx++}`);
    values.push(filters.salesUnit);
  }
  if (filters.customer) {
    conditions.push(`s.customer_id = $${idx++}`);
    values.push(filters.customer);
  }

  const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const limitClause = filters.limit ? `LIMIT $${idx++}` : '';
  if (filters.limit) values.push(filters.limit);

  const offsetClause = filters.offset ? `OFFSET $${idx++}` : '';
  if (filters.offset) values.push(filters.offset);

  const query = `
    SELECT
      s.invoice_id,
      s.date,
      s.customer_id,
      c.name AS customer_name,
      s.sales_unit_id,
      u.name AS sales_unit_name,
      s.material_id,
      p.name AS product_name,
      s.quantity,
      s.unit_price,
      s.discount,
      s.tax_amount AS item_tax,
      s.gross_amount AS item_gross,
      s.net_amount AS item_net
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    LEFT JOIN sales_units u ON s.sales_unit_id = u.id
    LEFT JOIN products p ON s.material_id = p.id
    ${whereClause}
    ORDER BY s.date DESC
    ${limitClause}
    ${offsetClause}
  `;

  const result = await db.query(query, values);
  return result.rows;
};