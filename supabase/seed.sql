-- Replace user UUID below with a real auth.users id after first signup if needed.
-- This seed is useful for local demos with Supabase SQL editor.

do $$
declare
  v_company_id uuid := gen_random_uuid();
  v_admin_user uuid := '11111111-1111-1111-1111-111111111111';
  v_client1 uuid := gen_random_uuid();
  v_client2 uuid := gen_random_uuid();
  v_client3 uuid := gen_random_uuid();
  v_project1 uuid := gen_random_uuid();
  v_project2 uuid := gen_random_uuid();
  v_project3 uuid := gen_random_uuid();
  v_project4 uuid := gen_random_uuid();
begin
  insert into public.companies (id, name, slug, phone, address, subscription_status)
  values (v_company_id, 'Atelier Martin Renovation', 'atelier-martin-renovation', '06 45 11 22 33', '12 rue des Tilleuls, Lyon', 'active')
  on conflict (slug) do nothing;

  insert into public.profiles (id, full_name, email, phone)
  values (v_admin_user, 'Julien Martin', 'julien@ateliermartin.fr', '06 45 11 22 33')
  on conflict (id) do nothing;

  insert into public.memberships (company_id, user_id, role)
  values (v_company_id, v_admin_user, 'admin')
  on conflict (company_id, user_id) do nothing;

  insert into public.clients (id, company_id, name, company_name, phone, email, address, notes)
  values
    (v_client1, v_company_id, 'Claire Dubois', null, '06 78 90 11 22', 'claire.dubois@email.fr', '18 avenue Carnot, Villeurbanne', 'Renovation maison complete.'),
    (v_client2, v_company_id, 'Nicolas Bernard', 'Bernard Invest', '06 11 22 33 44', 'nicolas@bernardinvest.fr', '4 impasse des Acacias, Caluire', 'Projet locatif, delai serre.'),
    (v_client3, v_company_id, 'Sophie Lambert', null, '06 55 66 77 88', 'sophie.lambert@email.fr', '31 rue Victor Hugo, Oullins', 'Cuisine + dressing sur mesure.');

  insert into public.projects (id, company_id, client_id, name, address, status, start_date, end_date, planned_budget, actual_cost, progress, description, notes)
  values
    (v_project1, v_company_id, v_client1, 'Renovation maison Dubois', '18 avenue Carnot, Villeurbanne', 'in_progress', '2026-02-01', '2026-05-30', 48000, 21500, 42, 'Isolation, plomberie, electricite, menuiserie.', 'Client souhaite un point hebdo.'),
    (v_project2, v_company_id, v_client2, 'Amenagement duplex Bernard', '4 impasse des Acacias, Caluire', 'quote', '2026-03-15', '2026-07-20', 36000, 0, 10, 'Escalier limon central + garde-corps.', 'Validation devis attendue.'),
    (v_project3, v_company_id, v_client3, 'Cuisine et dressing Lambert', '31 rue Victor Hugo, Oullins', 'in_progress', '2026-01-18', '2026-04-10', 28500, 19200, 68, 'Meubles sur mesure et finitions premium.', 'Coordination avec plombier externe.'),
    (v_project4, v_company_id, v_client1, 'Terrasse acier Dubois', '18 avenue Carnot, Villeurbanne', 'on_hold', '2026-04-05', '2026-06-01', 12500, 1800, 15, 'Garde-corps exterieur + reprises maçonnerie.', 'En attente meteo favorable.');

  insert into public.tasks (company_id, project_id, assignee_id, title, description, priority, status, due_date)
  values
    (v_company_id, v_project1, v_admin_user, 'Commander menuiseries', 'Validation dimensions baie vitree.', 'high', 'in_progress', '2026-03-10 10:00:00+01'),
    (v_company_id, v_project1, v_admin_user, 'Controle electricite RDC', 'Verifier tableau et prises cuisine.', 'urgent', 'todo', '2026-03-09 15:00:00+01'),
    (v_company_id, v_project1, null, 'Point client hebdo', 'Envoi photos et avancement.', 'medium', 'todo', '2026-03-11 18:00:00+01'),
    (v_company_id, v_project2, v_admin_user, 'Relance devis structure', 'Appeler le fournisseur acier.', 'high', 'todo', '2026-03-12 09:00:00+01'),
    (v_company_id, v_project2, null, 'Valider choix teinte metal', 'Demande echantillons RAL.', 'low', 'todo', '2026-03-14 14:00:00+01'),
    (v_company_id, v_project3, v_admin_user, 'Pose dressing suite parentale', 'Equipe 2 personnes.', 'high', 'in_progress', '2026-03-09 08:00:00+01'),
    (v_company_id, v_project3, null, 'Finaliser plan vasque', 'Confirmer passage siphon.', 'medium', 'blocked', '2026-03-13 11:00:00+01'),
    (v_company_id, v_project4, v_admin_user, 'Verifier ancrages terrasse', 'Prises de cotes complementaires.', 'urgent', 'todo', '2026-03-09 16:00:00+01'),
    (v_company_id, null, v_admin_user, 'Preparation planning semaine', 'Ajuster ressources et sous-traitance.', 'medium', 'done', '2026-03-08 17:00:00+01'),
    (v_company_id, null, null, 'Controle stock visserie', 'Inventaire atelier.', 'low', 'todo', '2026-03-15 09:00:00+01');

  insert into public.documents (company_id, project_id, client_id, uploaded_by, file_name, file_type, file_path, tags)
  values
    (v_company_id, v_project1, v_client1, v_admin_user, 'devis-renovation-dubois.pdf', 'application/pdf', v_company_id::text || '/devis-renovation-dubois.pdf', array['devis','renovation']),
    (v_company_id, v_project3, v_client3, v_admin_user, 'plan-cuisine-v3.pdf', 'application/pdf', v_company_id::text || '/plan-cuisine-v3.pdf', array['plan','cuisine']),
    (v_company_id, v_project4, v_client1, v_admin_user, 'photo-terrasse.jpg', 'image/jpeg', v_company_id::text || '/photo-terrasse.jpg', array['photo','terrasse']);

  insert into public.measurements (company_id, project_id, category, work_type, measured_at, dimensions, notes, sketch_notes, created_by)
  values
    (v_company_id, v_project2, 'escalier_limon_central', 'Escalier entree duplex', '2026-03-02', '{"width_mm":920,"height_mm":2940,"depth_mm":2850}', 'Verifier aplomb mur porteur.', 'Croquis: palier intermediaire a 1450 mm.', v_admin_user),
    (v_company_id, v_project4, 'garde_corps_terrasse', 'Garde-corps angle terrasse', '2026-03-04', '{"width_mm":4120,"height_mm":1100,"depth_mm":80}', 'Prevoir platines inox.', 'Croquis: retour angle 90 degres sur 780 mm.', v_admin_user),
    (v_company_id, v_project3, 'dressing', 'Dressing chambre parentale', '2026-02-20', '{"width_mm":2680,"height_mm":2470,"depth_mm":620}', 'Niche technique a gauche.', 'Croquis: colonne penderie + tiroirs bas.', v_admin_user);

  insert into public.subscriptions (company_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end)
  values (v_company_id, 'cus_demo_001', 'sub_demo_001', 'pro', 'active', '2026-04-09 00:00:00+01')
  on conflict (company_id) do nothing;
end $$;

