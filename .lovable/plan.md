
## Skauci Króla — MVP (faza 1)

Aplikacja webowa, mobile-first, w paletze logo SK (niebieski/czerwony/żółty/zielony + biel dominująca), z globalnym przełącznikiem trybu jasny/ciemny. Backend: Lovable Cloud (Supabase). **Bez PWA/offline na tym etapie** — dodamy w osobnym kroku.

### 1. Konta i role
- Auth: email + hasło (Lovable Cloud), bez publicznej rejestracji — formularz signup wyłączony w UI.
- Tabela `profiles` (id → auth.users, display_name, active).
- Enum `app_role`: `parent`, `scout`, `instructor`.
- Tabela `user_roles` + funkcja `has_role()` (security definer) — zgodnie z best practices.
- Trigger auto-tworzący profil po insert do auth.users.
- Pierwszy instruktor: po pierwszym zalogowaniu się utworzonym kontem, podasz mi email i ręcznie nadam rolę `instructor` (lub zaseeduję jeden konkretny email, jeśli podasz go teraz).

### 2. Strefy / nawigacja
- **Publicznie (bez logowania):** strona główna „Kim jesteśmy / Domowy Kościół / Ruch Światło-Życie", Strefa Rodzica (treść statyczna, informacyjna), Prawo Skautowe (read-only).
- **Po zalogowaniu (skaut/rodzic/instruktor):** Śpiewnik, Ulubione, konto.
- **Instruktor:** Panel administracyjny `/admin`.
- Mobile: dolny tab bar (Prawo · Śpiewnik · Ulubione · Więcej). Desktop: górny header + sidebar w panelu admina.

### 3. Prawo Skautowe
- Lista punktów prawa (numer, tytuł, treść, komentarz rozwijany — accordion).
- Czytelna typografia, dostępne publicznie.
- Wyszukiwarka lokalna (po tytule i treści).
- Edycja w panelu admina (edytor: H1/H2, listy, linki — Markdown).

### 4. Śpiewnik (serce MVP)
- Lista piosenek: tytuł, kategorie (ognisko/pielgrzymka/liturgia/patrolowe — multi-select tagów), tekst (Markdown).
- **Live search** po tytule i fragmencie tekstu, podświetlanie frazy w wynikach.
- Filtry kategorii (chipy).
- Widok piosenki: tekst, przycisk ⭐, „Kopiuj tekst", „Tryb pełnoekranowy".
- **Tryb pełnoekranowy:** ukryty UI, regulacja rozmiaru czcionki (+/−), przełącznik jasny/ciemny ekran (niezależny od globalnego motywu), wake-lock żeby ekran nie gasł.
- Edycja w panelu admina.

### 5. Ulubione ⭐
- Tabela `favorites (user_id, item_type, item_id)` — generycznie, gotowa na rozszerzenie w fazie 2.
- Toggle gwiazdki przy piosence i punkcie prawa.
- Zakładka „Ulubione" — zgrupowane po typie.

### 6. Panel administracyjny `/admin` (tylko `instructor`)
- **Konta:** lista użytkowników, dodaj konto (email + hasło + rola), zmiana roli, dezaktywacja, usunięcie. Tworzenie kont przez Edge Function z service-role key (admin tworzy → user dostaje email+hasło od admina).
- **Prawo:** CRUD punktów prawa.
- **Śpiewnik:** CRUD piosenek + edytor Markdown z paskiem (H1/H2, listy, linki).
- Walidacja, potwierdzenia, toasty.

### 7. Motyw i wygląd
- Design system w `index.css` + `tailwind.config.ts`: tokeny semantyczne na bazie palety logo (niebieski, czerwony, żółty, zielony, biel) w HSL.
- Kolory modułów: Prawo = niebieski, Śpiewnik = zielony, Ulubione = żółty, Admin = czerwony (akcenty/ikony/tagi).
- **Globalny przełącznik motywu** (jasny/ciemny) w headerze + zapamiętywanie w localStorage.
- Logo SK w nagłówku (skopiuję `skauci-logo.png` do `src/assets`).
- Komponenty: shadcn/ui (button, card, input, dialog, accordion, tabs, dropdown, sonner toasty).

### 8. Schemat bazy (skrót)
- `profiles`, `user_roles`, `app_role` enum
- `law_points (id, number, title, body, comment, order)`
- `songs (id, title, body, categories text[], created_by, updated_at)`
- `favorites (user_id, item_type, item_id)`
- RLS na wszystkich: read publiczny dla `law_points` i `songs` (songs tylko dla zalogowanych), write tylko dla `instructor`. `favorites` tylko własne.

### 9. Co świadomie pomijam w tej fazie
- PWA / service worker / offline cache (osobny krok).
- Symbolika, Mundur, Znaki patrolowe, Sprawności (faza 2).
- OneDrive / galerie (faza 2).
- Tokeny dostępowe dla niepełnoletnich, strefa instruktora z notatkami (faza 2/3).
- Wyszukiwarka globalna.
- Email auth templates (domyślne maile Lovable wystarczą — i tak admin ręcznie podaje hasło).

### 10. Po wdrożeniu
Test E2E: utworzysz konto admina → dodasz punkt prawa i piosenkę → zalogujesz się jako skaut na drugim oknie → dodasz piosenkę do ulubionych → odpalisz tryb pełnoekranowy.
