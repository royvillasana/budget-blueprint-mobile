-- Insert sample data for royvillasana@gmail.com for all 12 months
-- User ID: 59ba31d4-43ad-4bcb-b636-b884f3c47c87

-- First, get category IDs
\set user_id '59ba31d4-43ad-4bcb-b636-b884f3c47c87'

-- Insert INCOME for all months
INSERT INTO monthly_income_jan (month_id, user_id, source, amount, date, currency_code) VALUES 
  (1, :'user_id', 'Salario Principal', 2500.00, '2025-01-05', 'EUR'),
  (1, :'user_id', 'Freelance - Consultoría', 300.00, '2025-01-20', 'EUR'),
  (1, :'user_id', 'Intereses Bancarios', 15.50, '2025-01-30', 'EUR');

INSERT INTO monthly_income_feb (month_id, user_id, source, amount, date, currency_code) VALUES 
  (2, :'user_id', 'Salario Principal', 2500.00, '2025-02-05', 'EUR'),
  (2, :'user_id', 'Freelance - Diseño Gráfico', 400.00, '2025-02-15', 'EUR'),
  (2, :'user_id', 'Bono Empresarial', 200.00, '2025-02-28', 'EUR');

INSERT INTO monthly_income_mar (month_id, user_id, source, amount, date, currency_code) VALUES 
  (3, :'user_id', 'Salario Principal', 2500.00, '2025-03-05', 'EUR'),
  (3, :'user_id', 'Freelance - Consultoría', 350.00, '2025-03-18', 'EUR'),
  (3, :'user_id', 'Venta de Artículos Usados', 75.00, '2025-03-25', 'EUR');

INSERT INTO monthly_income_apr (month_id, user_id, source, amount, date, currency_code) VALUES 
  (4, :'user_id', 'Salario Principal', 2500.00, '2025-04-05', 'EUR'),
  (4, :'user_id', 'Freelance - Desarrollo Web', 500.00, '2025-04-20', 'EUR'),
  (4, :'user_id', 'Intereses Bancarios', 16.00, '2025-04-30', 'EUR');

INSERT INTO monthly_income_may (month_id, user_id, source, amount, date, currency_code) VALUES 
  (5, :'user_id', 'Salario Principal', 2500.00, '2025-05-05', 'EUR'),
  (5, :'user_id', 'Freelance - Consultoría', 300.00, '2025-05-19', 'EUR'),
  (5, :'user_id', 'Reembolso Seguro', 120.00, '2025-05-28', 'EUR');

INSERT INTO monthly_income_jun (month_id, user_id, source, amount, date, currency_code) VALUES 
  (6, :'user_id', 'Salario Principal', 2500.00, '2025-06-05', 'EUR'),
  (6, :'user_id', 'Bonus Semestral', 500.00, '2025-06-15', 'EUR'),
  (6, :'user_id', 'Freelance - Diseño', 250.00, '2025-06-28', 'EUR');

INSERT INTO monthly_income_jul (month_id, user_id, source, amount, date, currency_code) VALUES 
  (7, :'user_id', 'Salario Principal', 2500.00, '2025-07-05', 'EUR'),
  (7, :'user_id', 'Freelance - Desarrollo', 450.00, '2025-07-22', 'EUR'),
  (7, :'user_id', 'Intereses Bancarios', 17.00, '2025-07-31', 'EUR');

INSERT INTO monthly_income_aug (month_id, user_id, source, amount, date, currency_code) VALUES 
  (8, :'user_id', 'Salario Principal', 2500.00, '2025-08-05', 'EUR'),
  (8, :'user_id', 'Freelance - Consultoría', 350.00, '2025-08-20', 'EUR'),
  (8, :'user_id', 'Venta Online', 85.00, '2025-08-25', 'EUR');

INSERT INTO monthly_income_sep (month_id, user_id, source, amount, date, currency_code) VALUES 
  (9, :'user_id', 'Salario Principal', 2500.00, '2025-09-05', 'EUR'),
  (9, :'user_id', 'Freelance - Desarrollo Web', 500.00, '2025-09-18', 'EUR'),
  (9, :'user_id', 'Intereses Bancarios', 17.50, '2025-09-30', 'EUR');

INSERT INTO monthly_income_oct (month_id, user_id, source, amount, date, currency_code) VALUES 
  (10, :'user_id', 'Salario Principal', 2500.00, '2025-10-05', 'EUR'),
  (10, :'user_id', 'Freelance - Consultoría', 400.00, '2025-10-19', 'EUR'),
  (10, :'user_id', 'Comisión Ventas', 150.00, '2025-10-28', 'EUR');

INSERT INTO monthly_income_nov (month_id, user_id, source, amount, date, currency_code) VALUES 
  (11, :'user_id', 'Salario Principal', 2500.00, '2025-11-05', 'EUR'),
  (11, :'user_id', 'Bonus Adicional', 300.00, '2025-11-15', 'EUR'),
  (11, :'user_id', 'Freelance - Diseño', 350.00, '2025-11-25', 'EUR');

INSERT INTO monthly_income_dec (month_id, user_id, source, amount, date, currency_code) VALUES 
  (12, :'user_id', 'Salario Principal', 2500.00, '2025-12-05', 'EUR'),
  (12, :'user_id', 'Aguinaldo Navidad', 2500.00, '2025-12-15', 'EUR'),
  (12, :'user_id', 'Freelance - Consultoría', 300.00, '2025-12-28', 'EUR');

-- Insert EXPENSES (Transactions) for all months
-- January
INSERT INTO monthly_transactions_jan (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 1, :'user_id', id, 'Compra Bodega Semanal', -85.50, '2025-01-03', 'EXPENSE' FROM categories WHERE name = 'Alimentos' LIMIT 1;
INSERT INTO monthly_transactions_jan (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 1, :'user_id', id, 'Transporte Diario', -15.00, '2025-01-05', 'EXPENSE' FROM categories WHERE name = 'Transporte' LIMIT 1;
INSERT INTO monthly_transactions_jan (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 1, :'user_id', id, 'Pago Renta Apartamento', -500.00, '2025-01-01', 'EXPENSE' FROM categories WHERE name = 'Vivienda' LIMIT 1;
INSERT INTO monthly_transactions_jan (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 1, :'user_id', id, 'Recarga Telefonía', -20.00, '2025-01-10', 'EXPENSE' FROM categories WHERE name = 'Utilidades' LIMIT 1;
INSERT INTO monthly_transactions_jan (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 1, :'user_id', id, 'Cine - Película', -12.00, '2025-01-15', 'EXPENSE' FROM categories WHERE name = 'Entretenimiento' LIMIT 1;
INSERT INTO monthly_transactions_jan (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 1, :'user_id', id, 'Seguro Auto', -75.00, '2025-01-20', 'EXPENSE' FROM categories WHERE name = 'Seguros' LIMIT 1;
INSERT INTO monthly_transactions_jan (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 1, :'user_id', id, 'Medicina Farmacia', -35.00, '2025-01-22', 'EXPENSE' FROM categories WHERE name = 'Salud' LIMIT 1;

-- February
INSERT INTO monthly_transactions_feb (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 2, :'user_id', id, 'Compra Bodega Semanal', -92.30, '2025-02-02', 'EXPENSE' FROM categories WHERE name = 'Alimentos' LIMIT 1;
INSERT INTO monthly_transactions_feb (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 2, :'user_id', id, 'Pago Renta Apartamento', -500.00, '2025-02-01', 'EXPENSE' FROM categories WHERE name = 'Vivienda' LIMIT 1;
INSERT INTO monthly_transactions_feb (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 2, :'user_id', id, 'Restaurante Cena', -45.00, '2025-02-14', 'EXPENSE' FROM categories WHERE name = 'Alimentos' LIMIT 1;
INSERT INTO monthly_transactions_feb (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 2, :'user_id', id, 'Internet Hogar', -35.00, '2025-02-15', 'EXPENSE' FROM categories WHERE name = 'Utilidades' LIMIT 1;
INSERT INTO monthly_transactions_feb (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 2, :'user_id', id, 'Corte Cabello', -25.00, '2025-02-10', 'EXPENSE' FROM categories WHERE name = 'Cuidado Personal' LIMIT 1;
INSERT INTO monthly_transactions_feb (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 2, :'user_id', id, 'Pago Tarjeta Crédito', -300.00, '2025-02-25', 'EXPENSE' FROM categories WHERE name = 'Servicios Financieros' LIMIT 1;

-- March
INSERT INTO monthly_transactions_mar (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 3, :'user_id', id, 'Compra Bodega', -88.75, '2025-03-03', 'EXPENSE' FROM categories WHERE name = 'Alimentos' LIMIT 1;
INSERT INTO monthly_transactions_mar (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 3, :'user_id', id, 'Pago Renta Apartamento', -500.00, '2025-03-01', 'EXPENSE' FROM categories WHERE name = 'Vivienda' LIMIT 1;
INSERT INTO monthly_transactions_mar (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 3, :'user_id', id, 'Revisión Médica', -50.00, '2025-03-12', 'EXPENSE' FROM categories WHERE name = 'Salud' LIMIT 1;
INSERT INTO monthly_transactions_mar (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 3, :'user_id', id, 'Gasolina Auto', -40.00, '2025-03-18', 'EXPENSE' FROM categories WHERE name = 'Transporte' LIMIT 1;
INSERT INTO monthly_transactions_mar (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 3, :'user_id', id, 'Ropa Nueva', -60.00, '2025-03-20', 'EXPENSE' FROM categories WHERE name = 'Vestuario' LIMIT 1;

-- April
INSERT INTO monthly_transactions_apr (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 4, :'user_id', id, 'Compra Bodega Semanal', -95.00, '2025-04-02', 'EXPENSE' FROM categories WHERE name = 'Alimentos' LIMIT 1;
INSERT INTO monthly_transactions_apr (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 4, :'user_id', id, 'Pago Renta Apartamento', -500.00, '2025-04-01', 'EXPENSE' FROM categories WHERE name = 'Vivienda' LIMIT 1;
INSERT INTO monthly_transactions_apr (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 4, :'user_id', id, 'Cena Especial', -55.00, '2025-04-10', 'EXPENSE' FROM categories WHERE name = 'Alimentos' LIMIT 1;
INSERT INTO monthly_transactions_apr (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 4, :'user_id', id, 'Servicio Técnico Auto', -120.00, '2025-04-15', 'EXPENSE' FROM categories WHERE name = 'Mantenimiento Vehículo' LIMIT 1;
INSERT INTO monthly_transactions_apr (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 4, :'user_id', id, 'Suscripción Netflix', -15.99, '2025-04-20', 'EXPENSE' FROM categories WHERE name = 'Entretenimiento' LIMIT 1;

-- May
INSERT INTO monthly_transactions_may (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 5, :'user_id', id, 'Compra Bodega', -90.00, '2025-05-03', 'EXPENSE' FROM categories WHERE name = 'Alimentos' LIMIT 1;
INSERT INTO monthly_transactions_may (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 5, :'user_id', id, 'Pago Renta Apartamento', -500.00, '2025-05-01', 'EXPENSE' FROM categories WHERE name = 'Vivienda' LIMIT 1;
INSERT INTO monthly_transactions_may (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 5, :'user_id', id, 'Viaje de Fin de Semana', -150.00, '2025-05-15', 'EXPENSE' FROM categories WHERE name = 'Viajes' LIMIT 1;
INSERT INTO monthly_transactions_may (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 5, :'user_id', id, 'Medicinas', -30.00, '2025-05-20', 'EXPENSE' FROM categories WHERE name = 'Salud' LIMIT 1;

-- June
INSERT INTO monthly_transactions_jun (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 6, :'user_id', id, 'Compra Bodega Semanal', -100.00, '2025-06-02', 'EXPENSE' FROM categories WHERE name = 'Alimentos' LIMIT 1;
INSERT INTO monthly_transactions_jun (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 6, :'user_id', id, 'Pago Renta Apartamento', -500.00, '2025-06-01', 'EXPENSE' FROM categories WHERE name = 'Vivienda' LIMIT 1;
INSERT INTO monthly_transactions_jun (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 6, :'user_id', id, 'Cena Romántica', -75.00, '2025-06-14', 'EXPENSE' FROM categories WHERE name = 'Alimentos' LIMIT 1;
INSERT INTO monthly_transactions_jun (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 6, :'user_id', id, 'Gasolina', -45.00, '2025-06-18', 'EXPENSE' FROM categories WHERE name = 'Transporte' LIMIT 1;
INSERT INTO monthly_transactions_jun (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 6, :'user_id', id, 'Pago Servicios Médicos', -80.00, '2025-06-25', 'EXPENSE' FROM categories WHERE name = 'Salud' LIMIT 1;

-- July
INSERT INTO monthly_transactions_jul (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 7, :'user_id', id, 'Compra Bodega', -110.00, '2025-07-03', 'EXPENSE' FROM categories WHERE name = 'Alimentos' LIMIT 1;
INSERT INTO monthly_transactions_jul (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 7, :'user_id', id, 'Pago Renta Apartamento', -500.00, '2025-07-01', 'EXPENSE' FROM categories WHERE name = 'Vivienda' LIMIT 1;
INSERT INTO monthly_transactions_jul (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 7, :'user_id', id, 'Vacaciones - Hotel', -300.00, '2025-07-10', 'EXPENSE' FROM categories WHERE name = 'Viajes' LIMIT 1;
INSERT INTO monthly_transactions_jul (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 7, :'user_id', id, 'Comidas en Vacaciones', -120.00, '2025-07-15', 'EXPENSE' FROM categories WHERE name = 'Alimentos' LIMIT 1;

-- August
INSERT INTO monthly_transactions_aug (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 8, :'user_id', id, 'Compra Bodega Semanal', -93.00, '2025-08-02', 'EXPENSE' FROM categories WHERE name = 'Alimentos' LIMIT 1;
INSERT INTO monthly_transactions_aug (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 8, :'user_id', id, 'Pago Renta Apartamento', -500.00, '2025-08-01', 'EXPENSE' FROM categories WHERE name = 'Vivienda' LIMIT 1;
INSERT INTO monthly_transactions_aug (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 8, :'user_id', id, 'Reparación Computadora', -85.00, '2025-08-08', 'EXPENSE' FROM categories WHERE name = 'Tecnología' LIMIT 1;
INSERT INTO monthly_transactions_aug (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 8, :'user_id', id, 'Almuerzo con Amigos', -40.00, '2025-08-20', 'EXPENSE' FROM categories WHERE name = 'Alimentos' LIMIT 1;

-- September
INSERT INTO monthly_transactions_sep (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 9, :'user_id', id, 'Compra Bodega', -97.00, '2025-09-03', 'EXPENSE' FROM categories WHERE name = 'Alimentos' LIMIT 1;
INSERT INTO monthly_transactions_sep (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 9, :'user_id', id, 'Pago Renta Apartamento', -500.00, '2025-09-01', 'EXPENSE' FROM categories WHERE name = 'Vivienda' LIMIT 1;
INSERT INTO monthly_transactions_sep (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 9, :'user_id', id, 'Curso Online', -50.00, '2025-09-10', 'EXPENSE' FROM categories WHERE name = 'Educación' LIMIT 1;
INSERT INTO monthly_transactions_sep (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 9, :'user_id', id, 'Ropa Nueva', -70.00, '2025-09-18', 'EXPENSE' FROM categories WHERE name = 'Vestuario' LIMIT 1;

-- October
INSERT INTO monthly_transactions_oct (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 10, :'user_id', id, 'Compra Bodega Semanal', -102.00, '2025-10-02', 'EXPENSE' FROM categories WHERE name = 'Alimentos' LIMIT 1;
INSERT INTO monthly_transactions_oct (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 10, :'user_id', id, 'Pago Renta Apartamento', -500.00, '2025-10-01', 'EXPENSE' FROM categories WHERE name = 'Vivienda' LIMIT 1;
INSERT INTO monthly_transactions_oct (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 10, :'user_id', id, 'Celebración Cumpleaños', -80.00, '2025-10-12', 'EXPENSE' FROM categories WHERE name = 'Entretenimiento' LIMIT 1;
INSERT INTO monthly_transactions_oct (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 10, :'user_id', id, 'Gasolina Auto', -50.00, '2025-10-20', 'EXPENSE' FROM categories WHERE name = 'Transporte' LIMIT 1;

-- November
INSERT INTO monthly_transactions_nov (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 11, :'user_id', id, 'Compra Bodega', -105.00, '2025-11-03', 'EXPENSE' FROM categories WHERE name = 'Alimentos' LIMIT 1;
INSERT INTO monthly_transactions_nov (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 11, :'user_id', id, 'Pago Renta Apartamento', -500.00, '2025-11-01', 'EXPENSE' FROM categories WHERE name = 'Vivienda' LIMIT 1;
INSERT INTO monthly_transactions_nov (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 11, :'user_id', id, 'Compras Navidad', -150.00, '2025-11-15', 'EXPENSE' FROM categories WHERE name = 'Entretenimiento' LIMIT 1;
INSERT INTO monthly_transactions_nov (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 11, :'user_id', id, 'Mantenimiento Auto', -100.00, '2025-11-20', 'EXPENSE' FROM categories WHERE name = 'Mantenimiento Vehículo' LIMIT 1;

-- December
INSERT INTO monthly_transactions_dec (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 12, :'user_id', id, 'Compra Bodega Navidad', -150.00, '2025-12-02', 'EXPENSE' FROM categories WHERE name = 'Alimentos' LIMIT 1;
INSERT INTO monthly_transactions_dec (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 12, :'user_id', id, 'Pago Renta Apartamento', -500.00, '2025-12-01', 'EXPENSE' FROM categories WHERE name = 'Vivienda' LIMIT 1;
INSERT INTO monthly_transactions_dec (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 12, :'user_id', id, 'Regalos Navidad', -200.00, '2025-12-05', 'EXPENSE' FROM categories WHERE name = 'Entretenimiento' LIMIT 1;
INSERT INTO monthly_transactions_dec (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 12, :'user_id', id, 'Cena Navidad Restaurante', -100.00, '2025-12-24', 'EXPENSE' FROM categories WHERE name = 'Alimentos' LIMIT 1;
INSERT INTO monthly_transactions_dec (month_id, user_id, category_id, description, amount, date, direction) 
SELECT 12, :'user_id', id, 'Año Nuevo - Viaje', -250.00, '2025-12-28', 'EXPENSE' FROM categories WHERE name = 'Viajes' LIMIT 1;

-- Insert DEBTS for selected months
-- January
INSERT INTO monthly_debts_jan (month_id, user_id, debt_account_id, starting_balance, payment_made, ending_balance, interest_rate_apr, min_payment)
SELECT 1, :'user_id', id, 5000.00, 250.00, 4760.00, 18.5, 150.00 FROM accounts WHERE name = 'Tarjeta Crédito' LIMIT 1;

-- June
INSERT INTO monthly_debts_jun (month_id, user_id, debt_account_id, starting_balance, payment_made, ending_balance, interest_rate_apr, min_payment)
SELECT 6, :'user_id', id, 3500.00, 350.00, 3180.00, 8.5, 200.00 FROM accounts WHERE name = 'Préstamo Personal' LIMIT 1;

-- October
INSERT INTO monthly_debts_oct (month_id, user_id, debt_account_id, starting_balance, payment_made, ending_balance, interest_rate_apr, min_payment)
SELECT 10, :'user_id', id, 2500.00, 200.00, 2310.00, 5.2, 100.00 FROM accounts WHERE name = 'Crédito Automóvil' LIMIT 1;

-- December
INSERT INTO monthly_debts_dec (month_id, user_id, debt_account_id, starting_balance, payment_made, ending_balance, interest_rate_apr, min_payment)
SELECT 12, :'user_id', id, 1500.00, 500.00, 1020.00, 0.0, 0.00 FROM accounts WHERE name = 'Crédito Tienda' LIMIT 1;

-- Insert WISHLIST items for selected months
-- January - Tech wishes
INSERT INTO monthly_wishlist_jan (month_id, user_id, category_id, item, estimated_cost, priority)
SELECT 1, :'user_id', id, 'Laptop Nueva - Dell XPS 15', 1200.00, 1 FROM categories WHERE name = 'Tecnología' LIMIT 1;
INSERT INTO monthly_wishlist_jan (month_id, user_id, category_id, item, estimated_cost, priority)
SELECT 1, :'user_id', id, 'Monitor 4K para Oficina', 400.00, 2 FROM categories WHERE name = 'Tecnología' LIMIT 1;
INSERT INTO monthly_wishlist_jan (month_id, user_id, category_id, item, estimated_cost, priority)
SELECT 1, :'user_id', id, 'Silla Ergonómica Gamer', 350.00, 3 FROM categories WHERE name = 'Entretenimiento' LIMIT 1;

-- June - Travel wishes
INSERT INTO monthly_wishlist_jun (month_id, user_id, category_id, item, estimated_cost, priority)
SELECT 6, :'user_id', id, 'Viaje a París - 1 Semana', 2500.00, 1 FROM categories WHERE name = 'Viajes' LIMIT 1;
INSERT INTO monthly_wishlist_jun (month_id, user_id, category_id, item, estimated_cost, priority)
SELECT 6, :'user_id', id, 'Cámara Digital Canon EOS', 800.00, 2 FROM categories WHERE name = 'Tecnología' LIMIT 1;

-- September - Education wishes
INSERT INTO monthly_wishlist_sep (month_id, user_id, category_id, item, estimated_cost, priority)
SELECT 9, :'user_id', id, 'Certificación AWS Cloud', 300.00, 1 FROM categories WHERE name = 'Educación' LIMIT 1;
INSERT INTO monthly_wishlist_sep (month_id, user_id, category_id, item, estimated_cost, priority)
SELECT 9, :'user_id', id, 'Máster en Data Science Online', 5000.00, 2 FROM categories WHERE name = 'Educación' LIMIT 1;

-- December - Home wishes
INSERT INTO monthly_wishlist_dec (month_id, user_id, category_id, item, estimated_cost, priority)
SELECT 12, :'user_id', id, 'Sofá Nuevo para Sala', 900.00, 1 FROM categories WHERE name = 'Vivienda' LIMIT 1;
INSERT INTO monthly_wishlist_dec (month_id, user_id, category_id, item, estimated_cost, priority)
SELECT 12, :'user_id', id, 'Smart TV 55 pulgadas', 600.00, 2 FROM categories WHERE name = 'Tecnología' LIMIT 1;
INSERT INTO monthly_wishlist_dec (month_id, user_id, category_id, item, estimated_cost, priority)
SELECT 12, :'user_id', id, 'Sistema de Sonido Envolvente', 1500.00, 3 FROM categories WHERE name = 'Entretenimiento' LIMIT 1;

-- Verify data inserted
SELECT 'Ingresos' as type, COUNT(*) as total FROM all_transactions WHERE user_id = :'user_id' AND direction = 'INCOME'
UNION ALL
SELECT 'Gastos', COUNT(*) FROM all_transactions WHERE user_id = :'user_id' AND direction = 'EXPENSE'
UNION ALL
SELECT 'Deudas', COUNT(*) FROM all_debts WHERE user_id = :'user_id'
UNION ALL
SELECT 'Lista de Deseos', COUNT(*) FROM monthly_wishlist_jan WHERE user_id = :'user_id';
