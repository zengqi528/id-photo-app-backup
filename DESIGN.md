# Design System: AI ID Photo Specialist
**Project Type:** ID Photo Web Application (Mobile-First)

## 1. Visual Theme & Atmosphere
The design should evoke a feeling of **"Professional Trust & Modern Efficiency."**
*   **Vibe:** Clean, airy, and trustworthy. It should feel like a premium utility app.
*   **Density:** Spacious comfortably layout, focusing on the primary action (taking/uploading photos).
*   **Aesthetic:** "Glassmorphism" touches, soft gradients, and rounded approachable geometry. High-end mobile app feel.

## 2. Color Palette & Roles
*   **Primary Brand:** "Electric Blue Gradient" (`linear-gradient(135deg, #6366f1 0%, #a855f7 100%)`) - Used for primary call-to-action buttons and headers. Represents technology and magic.
*   **Secondary Accent:** "Soft Sky" (`#e0f2fe`) - Used for backgrounds of active cards or highlights.
*   **Surface Base:** "Pure White" (`#ffffff`) - Main card backgrounds.
*   **App Background:** "off-white" (`#f8fafc`) - The canvas background to let white cards pop.
*   **Text Primary:** "Dark Slate" (`#1e293b`) - Main readable text.
*   **Text Secondary:** "Cool Grey" (`#64748b`) - Subtitles and descriptions.
*   **Success:** "Emerald Soft" (`#10b981`) - For completion states.

## 3. Typography Rules
*   **Font Family:** System UI stack (San Francisco/Inter/Roboto) for maximum native feel.
*   **Headers:** Bold, tight tracking. `text-xl` to `text-3xl`.
*   **Body:** Regular weighting, readable line-height (1.5). `text-base`.
*   **Labels:** Medium weight, slightly smaller. `text-sm`.

## 4. Component Stylings
*   **Buttons:**
    *   *Primary:* Pill-shaped (`rounded-full`), gradient background, white text, subtle shadow (`shadow-lg`). Hover effects: scale up slightly.
    *   *Secondary:* White background, colored border/text, pill-shaped.
*   **Cards:**
    *   Generously rounded corners (`rounded-2xl`).
    *   Pure white background.
    *   Soft diffuse shadow (`shadow-md`).
    *   Border: none or extremely subtle (`border-slate-100`).
*   **Photo Options Grid:**
    *   Grid layout for selecting sizes (1 inch, 2 inch, etc.).
    *   Selectable items have a thick primary border or checkmark badge.

## 5. Layout Principles
*   **Mobile-First Container:** The app should be centered in a max-width container (e.g., `max-w-md`) on desktop to simulate the mobile app experience, but fully responsive.
*   **Spacing:** Generous padding (`p-6`) around containers.
*   **Navigation:** Bottom tab bar for primary navigation (Home, Orders, Profile) - typical of mini-programs.

## 6. Key Screens
1.  **Home:**
    *   Header: "Welcome/Service Selection".
    *   Hero: "Take Photo / Upload" giant action area.
    *   Quick Tools: "Change Background", "Change Size".
    *   Presets: Grid of common ID types (Visa, Passport, Resume).
2.  **Editor:**
    *   Canvas: Showing the uploaded photo.
    *   Controls: Bottom sheet or toolbar for "Background Color", "Clothes" (optional), "Beauty" (optional).
3.  **Result/Download:**
    *   Preview of the final sheet.
    *   Download/Save buttons.
