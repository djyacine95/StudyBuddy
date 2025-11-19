# StudyBuddy Design Guidelines

## Design Approach

**System:** Modern Productivity Hybrid drawing from Linear's clean aesthetics, Notion's accessibility, and Slack's collaborative interfaces.

**Rationale:** StudyBuddy is a utility-focused productivity tool requiring information density (schedules, matches, agendas) while maintaining student-friendly approachability. The design balances efficiency with warmth to encourage consistent usage.

## Typography

**Font Stack:**
- Primary: Inter (via Google Fonts CDN)
- Headings: Inter 600-700
- Body: Inter 400-500
- Code/Data: Inter 400 (mono-spaced numbers)

**Scale:**
- Hero/Display: text-5xl to text-6xl (48-60px)
- Page Titles: text-3xl to text-4xl (30-36px)
- Section Headers: text-2xl (24px)
- Card Titles: text-lg font-semibold (18px)
- Body: text-base (16px)
- Captions/Meta: text-sm (14px)
- Micro-labels: text-xs (12px)

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistency
- Micro spacing: p-2, gap-2 (8px)
- Component internal: p-4, gap-4 (16px)
- Section spacing: py-12 to py-20 (48-80px)
- Container max-width: max-w-7xl for main content

**Grid System:**
- Dashboard: 3-column grid (lg:grid-cols-3) for group cards
- Session agendas: 2-column split (details | checklist)
- Mobile: Always single column stacking

## Component Library

### Navigation
**Top Navigation Bar:**
- Fixed header with logo left, navigation center, profile/notifications right
- Height: h-16 (64px)
- Include: Dashboard, My Groups, Schedule, Settings
- Profile dropdown with avatar, name, sign out
- Notification bell with badge counter

### Hero Section (Landing Page)
**Layout:**
- Full-width section with compelling image showing students collaborating
- Split layout: 60% compelling headline/CTA, 40% hero image
- Headline: "Find Your Perfect Study Squad" with supporting subheadline
- Primary CTA: Large button "Get Started Free"
- Social proof: "Join 10,000+ students studying smarter together"
- Height: min-h-screen on desktop, natural height on mobile

### Dashboard Cards
**Study Group Cards:**
- Elevated cards with subtle shadow (shadow-md)
- Header: Group name + member count + upcoming session badge
- Member avatars: Overlapping circles showing 3-4 members
- Next session info: Date, time, topic preview
- Quick actions: "Join Session" button, chat icon, menu
- Padding: p-6
- Rounded corners: rounded-lg

**Upcoming Sessions Widget:**
- Timeline-style list with date markers
- Each session: Course name, time, AI-generated topic summary
- Visual indicator for sessions within 24 hours
- "Generate Agenda" button for upcoming sessions

### AI-Generated Agenda View
**Layout:**
- Centered card design, max-w-3xl
- Header: Session title, date/time, estimated duration (60-90 min)
- Three sections vertically stacked:
  1. **Objectives** (bullet list, clear goals)
  2. **Practice Questions** (numbered 1-6, expandable answers)
  3. **Time Schedule** (timeline with intervals: 0-15min, 15-30min, etc.)
- Footer: "Export to Calendar" + "Share with Group" buttons
- Generous spacing between sections: space-y-8

### Group Chat Interface
**Layout:**
- Right sidebar or dedicated page
- Header: Group name + member list (expandable)
- Message feed: Reverse chronological with timestamps
- Message bubbles: Sender avatar + name + message + time
- Input: Fixed bottom with text input + send button
- Real-time typing indicators
- Padding: p-4 for messages, gap-2 between bubbles

### Profile Setup & Preferences
**Multi-step Form:**
- Progress indicator at top (step 1 of 4)
- Large, clear form fields with labels above
- Steps: 1) Basic info, 2) Class schedule, 3) Availability, 4) Preferences
- Availability picker: Visual calendar grid with clickable time slots
- Topics input: Tag-based chips with autocomplete
- Large "Continue" button at bottom right
- "Skip for now" link for optional fields

### Schedule Import/Management
**Interface:**
- Drag-and-drop CSV upload zone with icon
- Alternative: Manual entry with "+ Add Class" button
- Table view: Course name | Meeting times | Exam dates | Actions
- Visual calendar preview below table
- Edit/delete icons for each row

### Landing Page Sections

**1. Hero Section** (described above)

**2. How It Works**
- 3-column grid showcasing process
- Icons: Profile setup → Smart matching → Study together
- Each column: Icon, title, 2-sentence description
- Padding: py-20

**3. Features Showcase**
- 4-column grid (2-col on tablet, 1-col mobile)
- Features: AI Agendas, Smart Matching, Chat Tools, Calendar Sync
- Each card: Icon, title, description
- Icons from Heroicons
- Padding: py-16

**4. AI-Powered Agendas Preview**
- 2-column layout: Left = screenshot/mockup, Right = benefits list
- Headline: "Every Session Has a Plan"
- Benefits: Checkmark list of AI agenda features
- Asymmetric layout for visual interest
- Padding: py-20

**5. Social Proof**
- 3-column testimonial cards
- Each: Student photo, quote, name + university
- Star ratings optional
- Padding: py-16

**6. CTA Section**
- Centered content, max-w-2xl
- Headline: "Ready to Study Smarter?"
- Large primary button + secondary "Learn More"
- Background treatment: Subtle gradient or geometric pattern
- Padding: py-24

**Footer:**
- 4-column layout: About, Features, Resources, Connect
- Newsletter signup form: "Get study tips weekly"
- Social icons (Twitter, Instagram, LinkedIn)
- Privacy policy, Terms of service links
- Padding: py-12

## Animations

**Minimal Use:**
- Hover states: Subtle scale (scale-105) on cards
- Button states: Built-in component hover/active states
- Page transitions: Simple fade-in for route changes
- Loading states: Spinner for AI agenda generation
- No scroll-triggered animations
- No elaborate entrance effects

## Icons

**Library:** Heroicons (via CDN)
**Usage:**
- Navigation: Outline style, 24px
- Feature cards: Outline style, 32-48px
- Buttons: Solid style, 20px
- Inline actions: Outline style, 20px

## Images

**Hero Section:**
- Large, high-quality image of diverse students collaborating at a table with laptops and notebooks
- Warm, natural lighting conveying productivity and friendship
- Placement: Right 40% of hero section

**Features Section:**
- Screenshot mockups of actual interface (dashboard, agenda, chat)
- Clean device frames or browser windows
- Placement: Alternating left/right in features showcase

**Testimonials:**
- Student profile photos: Circular crops, friendly expressions
- Authentic, not stock photography feel
- Placement: Top of each testimonial card

**About/How It Works:**
- Simple illustration or icon-based visuals
- Focus on clarity over photorealism

## Accessibility

- Minimum touch targets: 44×44px for all interactive elements
- Form inputs: Consistent height h-12, clear focus states (ring-2)
- Labels: Always visible, positioned above inputs
- Error states: Red text + icon, descriptive messages
- Skip links for keyboard navigation
- ARIA labels for icon-only buttons
- Color contrast: Ensure 4.5:1 minimum for text

## Privacy & Trust Indicators

- Privacy controls: Toggle switches with clear labels in Settings
- Data usage: Explanatory text under opt-in checkboxes
- Delete account: Prominent button in Settings with confirmation modal
- Trust badges in footer: "Student data protected" + security icons