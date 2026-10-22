// Listas e nomes das notificações, sem Zod: o sino do cabeçalho usa isto em
// todas as páginas do app e não deve levar a biblioteca de validação junto.
export const NOTIFICATION_KINDS = ["info", "aviso", "novidade"] as const;
export const NOTIFICATION_AUDIENCES = [
  "todos",
  "membro",
  "intensivo",
  "usuario",
] as const;

export const KIND_LABELS: Record<(typeof NOTIFICATION_KINDS)[number], string> = {
  info: "Informação",
  aviso: "Aviso",
  novidade: "Novidade",
};

export const AUDIENCE_LABELS: Record<
  (typeof NOTIFICATION_AUDIENCES)[number],
  string
> = {
  todos: "Todos os alunos",
  membro: "Só Membro (inclui teste grátis)",
  intensivo: "Só Intensivo",
  usuario: "Um aluno específico",
};
