export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Role = "admin" | "member";
export type ProjectStatus = "quote" | "in_progress" | "done" | "on_hold";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type MeasurementCategory =
  | "escalier_demi_quart_tournant"
  | "escalier_limon_central"
  | "garde_corps_terrasse"
  | "dressing"
  | "meuble_salle_de_bain";

export interface Company {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  subscription_status: "trial" | "active" | "past_due" | "canceled";
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  company_id: string;
  name: string;
  company_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  company_id: string;
  client_id: string | null;
  name: string;
  address: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  planned_budget: number;
  actual_cost: number;
  progress: number;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  company_id: string;
  project_id: string | null;
  assignee_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentRecord {
  id: string;
  company_id: string;
  project_id: string | null;
  client_id: string | null;
  uploaded_by: string | null;
  file_name: string;
  file_type: string;
  file_path: string;
  tags: string[];
  created_at: string;
}

export interface Measurement {
  id: string;
  company_id: string;
  project_id: string;
  category: MeasurementCategory;
  work_type: string;
  measured_at: string;
  dimensions: Json;
  notes: string | null;
  sketch_notes: string | null;
  created_by: string | null;
  created_at: string;
}

