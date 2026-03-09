import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court")
});

export const signupSchema = z.object({
  companyName: z.string().min(2),
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export const clientSchema = z.object({
  name: z.string().min(2),
  company_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional()
});

export const projectSchema = z.object({
  name: z.string().min(3),
  client_id: z.string().uuid().optional().or(z.literal("")),
  address: z.string().optional(),
  status: z.enum(["quote", "in_progress", "done", "on_hold"]),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  planned_budget: z.coerce.number().nonnegative(),
  actual_cost: z.coerce.number().nonnegative().default(0),
  progress: z.coerce.number().min(0).max(100).default(0),
  description: z.string().optional(),
  notes: z.string().optional()
});

export const taskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["todo", "in_progress", "blocked", "done"]),
  due_date: z.string().optional(),
  project_id: z.string().uuid().optional().or(z.literal(""))
});

export const measurementSchema = z.object({
  project_id: z.string().uuid(),
  category: z.enum([
    "escalier_demi_quart_tournant",
    "escalier_limon_central",
    "garde_corps_terrasse",
    "dressing",
    "meuble_salle_de_bain"
  ]),
  work_type: z.string().min(2),
  measured_at: z.string(),
  width_mm: z.coerce.number().positive(),
  height_mm: z.coerce.number().positive(),
  depth_mm: z.coerce.number().positive(),
  notes: z.string().optional(),
  sketch_notes: z.string().optional()
});


