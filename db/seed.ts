import { env } from "cloudflare:workers";

export async function seedShiftData() {
  if (!env.DB) throw new Error("Database unavailable");

  try {
    // Seed Shift Types com dados reais
    await env.DB.batch([
      env.DB.prepare(`
        INSERT OR IGNORE INTO shift_types (name, code, color, start_time, end_time, qsl_frequency_minutes)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind("Abertura", "ABERTURA", "#4CAF50", "06:00", "12:00", 60),

      env.DB.prepare(`
        INSERT OR IGNORE INTO shift_types (name, code, color, start_time, end_time, qsl_frequency_minutes)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind("Transição", "TRANSICAO", "#FF9800", "12:00", "17:00", 60),

      env.DB.prepare(`
        INSERT OR IGNORE INTO shift_types (name, code, color, start_time, end_time, qsl_frequency_minutes)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind("Fecho", "FECHO", "#F44336", "22:00", "23:30", 45),
    ]);

    // Seed Areas com dados reais (5 áreas)
    await env.DB.batch([
      env.DB.prepare(`
        INSERT OR IGNORE INTO areas (name, color)
        VALUES (?, ?)
      `).bind("Sala", "#4CAF50"),

      env.DB.prepare(`
        INSERT OR IGNORE INTO areas (name, color)
        VALUES (?, ?)
      `).bind("Balcão", "#2196F3"),

      env.DB.prepare(`
        INSERT OR IGNORE INTO areas (name, color)
        VALUES (?, ?)
      `).bind("Produção", "#FF9800"),

      env.DB.prepare(`
        INSERT OR IGNORE INTO areas (name, color)
        VALUES (?, ?)
      `).bind("Áreas Internas", "#9C27B0"),

      env.DB.prepare(`
        INSERT OR IGNORE INTO areas (name, color)
        VALUES (?, ?)
      `).bind("Sanitários", "#F44336"),
    ]);

    // Seed QSL Points com dados reais (5 pontos)
    await env.DB.batch([
      env.DB.prepare(`
        INSERT OR IGNORE INTO qsl_points (code, name, area_id, order_index)
        VALUES (?, ?, ?, ?)
      `).bind("QSL-SALA", "Sala", 1, 1),

      env.DB.prepare(`
        INSERT OR IGNORE INTO qsl_points (code, name, area_id, order_index)
        VALUES (?, ?, ?, ?)
      `).bind("QSL-BALCAO", "Balcão", 2, 2),

      env.DB.prepare(`
        INSERT OR IGNORE INTO qsl_points (code, name, area_id, order_index)
        VALUES (?, ?, ?, ?)
      `).bind("QSL-PRODUCAO", "Produção", 3, 3),

      env.DB.prepare(`
        INSERT OR IGNORE INTO qsl_points (code, name, area_id, order_index)
        VALUES (?, ?, ?, ?)
      `).bind("QSL-AREAS-INT", "Áreas Internas", 4, 4),

      env.DB.prepare(`
        INSERT OR IGNORE INTO qsl_points (code, name, area_id, order_index)
        VALUES (?, ?, ?, ?)
      `).bind("QSL-SANITARIOS", "Sanitários", 5, 5),
    ]);

    // Seed Task Templates - ABERTURA (exemplo com tarefas críticas)
    const aberturaShiftTypeId = await env.DB.prepare("SELECT id FROM shift_types WHERE code = 'ABERTURA'").first<{ id: number }>();
    const areaInternaId = await env.DB.prepare("SELECT id FROM areas WHERE name = 'Áreas Internas'").first<{ id: number }>();
    const areaSalaId = await env.DB.prepare("SELECT id FROM areas WHERE name = 'Sala'").first<{ id: number }>();
    const areaBalcaoId = await env.DB.prepare("SELECT id FROM areas WHERE name = 'Balcão'").first<{ id: number }>();
    const areaProducaoId = await env.DB.prepare("SELECT id FROM areas WHERE name = 'Produção'").first<{ id: number }>();

    if (aberturaShiftTypeId && areaInternaId && areaSalaId && areaBalcaoId && areaProducaoId) {
      await env.DB.batch([
        // Tarefas críticas - Abertura
        env.DB.prepare(`
          INSERT OR IGNORE INTO task_templates
          (name, shift_type_id, area_id, order_index, scheduled_time, deadline_time,
           criticality, response_type, allow_na, assigned_role, photo_required)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind("Abertura das instalações", aberturaShiftTypeId.id, areaInternaId.id, 1, "05:45", "06:00",
                 "critical", "yes_no", 0, "GT", 0),

        env.DB.prepare(`
          INSERT OR IGNORE INTO task_templates
          (name, shift_type_id, area_id, order_index, scheduled_time, deadline_time,
           criticality, response_type, allow_na, assigned_role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind("Inspeção inicial da sala", aberturaShiftTypeId.id, areaSalaId.id, 2, "06:00", "06:15",
                 "high", "yes_no", 0, "GT"),

        env.DB.prepare(`
          INSERT OR IGNORE INTO task_templates
          (name, shift_type_id, area_id, order_index, scheduled_time, deadline_time,
           criticality, response_type, allow_na, assigned_role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind("Verificação do balcão", aberturaShiftTypeId.id, areaBalcaoId.id, 3, "06:00", "06:15",
                 "normal", "yes_no", 0, "Empregado"),

        env.DB.prepare(`
          INSERT OR IGNORE INTO task_templates
          (name, shift_type_id, area_id, order_index, scheduled_time, deadline_time,
           criticality, response_type, allow_na, assigned_role, photo_required)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind("Teste de equipamentos", aberturaShiftTypeId.id, areaProducaoId.id, 4, "06:15", "06:30",
                 "critical", "yes_no", 0, "Chef", 1),

        env.DB.prepare(`
          INSERT OR IGNORE INTO task_templates
          (name, shift_type_id, area_id, order_index, scheduled_time, deadline_time,
           criticality, response_type, allow_na, assigned_role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind("Preparação de mise en place", aberturaShiftTypeId.id, areaProducaoId.id, 5, "06:30", "07:00",
                 "high", "yes_no", 0, "Chef"),

        env.DB.prepare(`
          INSERT OR IGNORE INTO task_templates
          (name, shift_type_id, area_id, order_index, scheduled_time, deadline_time,
           criticality, response_type, allow_na, assigned_role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind("Verificação de sistemas de TI", aberturaShiftTypeId.id, areaInternaId.id, 6, "06:30", "07:00",
                 "critical", "yes_no", 0, "GT"),

        env.DB.prepare(`
          INSERT OR IGNORE INTO task_templates
          (name, shift_type_id, area_id, order_index, scheduled_time, deadline_time,
           criticality, response_type, allow_na, assigned_role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind("Revisão de stock", aberturaShiftTypeId.id, areaInternaId.id, 7, "07:00", "07:30",
                 "normal", "yes_no", 1, "GT"),
      ]);
    }

    // Seed Task Templates - FECHO
    const fechoShiftTypeId = await env.DB.prepare("SELECT id FROM shift_types WHERE code = 'FECHO'").first<{ id: number }>();

    if (fechoShiftTypeId && areaInternaId && areaSalaId && areaBalcaoId && areaProducaoId) {
      await env.DB.batch([
        // Tarefas críticas - Fecho
        env.DB.prepare(`
          INSERT OR IGNORE INTO task_templates
          (name, shift_type_id, area_id, order_index, scheduled_time, deadline_time,
           criticality, response_type, allow_na, assigned_role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind("Encerramento de vendas", fechoShiftTypeId.id, areaInternaId.id, 1, "22:00", "22:10",
                 "high", "yes_no", 0, "GT"),

        env.DB.prepare(`
          INSERT OR IGNORE INTO task_templates
          (name, shift_type_id, area_id, order_index, scheduled_time, deadline_time,
           criticality, response_type, allow_na, assigned_role, photo_required)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind("Limpeza profunda cozinha", fechoShiftTypeId.id, areaProducaoId.id, 2, "22:15", "22:45",
                 "critical", "yes_no", 0, "Pessoal Limpeza", 1),

        env.DB.prepare(`
          INSERT OR IGNORE INTO task_templates
          (name, shift_type_id, area_id, order_index, scheduled_time, deadline_time,
           criticality, response_type, allow_na, assigned_role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind("Limpeza da sala", fechoShiftTypeId.id, areaSalaId.id, 3, "22:15", "22:45",
                 "high", "yes_no", 0, "Pessoal Limpeza"),

        env.DB.prepare(`
          INSERT OR IGNORE INTO task_templates
          (name, shift_type_id, area_id, order_index, scheduled_time, deadline_time,
           criticality, response_type, allow_na, assigned_role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind("Verificação de temperatura câmaras", fechoShiftTypeId.id, areaInternaId.id, 4, "22:30", "22:40",
                 "critical", "yes_no", 0, "GT"),

        env.DB.prepare(`
          INSERT OR IGNORE INTO task_templates
          (name, shift_type_id, area_id, order_index, scheduled_time, deadline_time,
           criticality, response_type, allow_na, assigned_role, photo_required)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind("Recolha de caixa", fechoShiftTypeId.id, areaInternaId.id, 5, "22:45", "22:55",
                 "critical", "yes_no", 0, "GT", 1),

        env.DB.prepare(`
          INSERT OR IGNORE INTO task_templates
          (name, shift_type_id, area_id, order_index, scheduled_time, deadline_time,
           criticality, response_type, allow_na, assigned_role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind("Apagamento de luzes", fechoShiftTypeId.id, areaInternaId.id, 6, "23:00", "23:10",
                 "normal", "yes_no", 0, "Pessoal"),

        env.DB.prepare(`
          INSERT OR IGNORE INTO task_templates
          (name, shift_type_id, area_id, order_index, scheduled_time, deadline_time,
           criticality, response_type, allow_na, assigned_role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind("Fechamento de alarmes", fechoShiftTypeId.id, areaInternaId.id, 7, "23:15", "23:25",
                 "critical", "yes_no", 0, "GT"),

        env.DB.prepare(`
          INSERT OR IGNORE INTO task_templates
          (name, shift_type_id, area_id, order_index, scheduled_time, deadline_time,
           criticality, response_type, allow_na, assigned_role, photo_required)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind("Verificação final", fechoShiftTypeId.id, areaInternaId.id, 8, "23:20", "23:30",
                 "high", "yes_no", 0, "GT", 1),
      ]);
    }

  } catch (error) {
    console.error("Error seeding shift data:", error);
    throw error;
  }
}
