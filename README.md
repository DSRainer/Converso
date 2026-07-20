# Converso - Real-time AI Teaching Platform

Converso is a modern Learning Management System (LMS) SaaS application that provides real-time AI-powered voice companions for interactive learning experiences. Built with Next.js 16, it leverages cutting-edge technologies including Vapi for voice AI, Clerk for authentication and billing, and Supabase for data management.

## 🚀 Tech Stack

- **Framework**: Next.js 16.2.10 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Authentication**: Clerk
- **Billing**: Clerk Billing
- **Voice AI**: Vapi (@vapi-ai/web)
- **Database**: Supabase
- **Error Monitoring**: Sentry
- **Forms**: React Hook Form + Zod
- **Animations**: Lottie React

## 📋 Table of Contents

- [Vapi Integration](#vapi-integration)
- [Clerk Authentication](#clerk-authentication)
- [Clerk Billing Integration](#clerk-billing-integration)
- [Subscription Feature Enforcement](#subscription-feature-enforcement)
- [Best Practices](#best-practices)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)

## 🎤 Vapi Integration

Vapi is the core technology powering Converso's real-time voice AI companions. It enables seamless voice-to-voice interactions with AI tutors.

### SDK Setup

The Vapi SDK is initialized in `lib/vapi.sdk.ts`:

```typescript
import Vapi from '@vapi-ai/web'

export const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);
```

### Assistant Configuration

The AI assistant is configured in `lib/utils.ts` with the `configureAssistant` function, which sets up:

- **Transcription**: Deepgram Nova-3 model for accurate speech-to-text
- **Voice Synthesis**: 11Labs for natural text-to-speech with customizable voice parameters
- **AI Model**: OpenAI GPT-4 for intelligent responses
- **System Prompt**: Custom tutoring guidelines that maintain conversation flow and educational focus

```typescript
export const configureAssistant = (voice: string, style: string) => {
  const vapiAssistant: CreateAssistantDTO = {
    name: "Companion",
    firstMessage: "Hello, let's start the session...",
    transcriber: {
      provider: "deepgram",
      model: "nova-3",
      language: "en",
    },
    voice: {
      provider: "11labs",
      voiceId: voiceId,
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 0.9,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [/* system prompt */],
    },
  };
  return vapiAssistant;
};
```

### Real-time Voice Interaction

The `AICompanion` component (`components/AICompanion.tsx`) manages the entire voice session lifecycle:

- **Call States**: INACTIVE, CONNECTING, ACTIVE, FINISHED
- **Event Handling**: Listens for call-start, call-end, message, error, speech-start, speech-end events
- **Visual Feedback**: Lottie animations for speaking states, subject-based color theming
- **Transcript Display**: Real-time conversation history with role-based styling
- **Microphone Control**: Toggle mute/unmute during active sessions

### Voice Customization

The application supports multiple voice profiles defined in `constants/index.ts`:

- **Male Voices**: Casual and formal styles
- **Female Voices**: Casual and formal styles
- **Subject-based colors**: Visual theming for different learning subjects

## 🔐 Clerk Authentication

Clerk provides comprehensive authentication and user management for Converso.

### Provider Setup

The ClerkProvider wraps the entire application in `app/layout.tsx`:

```typescript
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClerkProvider>
          <Header />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
```

### Authentication Components

The `Header` component (`components/Header.tsx`) implements authentication UI:

- **SignInButton**: For user sign-in
- **SignUpButton**: For user registration
- **UserButton**: For authenticated user profile management
- **Conditional Rendering**: Uses Clerk's `Show` component for signed-in/signed-out states

### Server-Side Authentication

Server actions use Clerk's server auth for secure operations:

```typescript
import { auth } from "@clerk/nextjs/server"

export const createCompanion = async(formData: CreateCompanion) => {
  const { userId : author } = await auth();
  // ... secure database operations
}
```

### Supabase Integration

Clerk authentication is integrated with Supabase for secure data access in `lib/supabase.ts`:

```typescript
export const createSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      async accessToken () {
        return ((await auth()).getToken())
      }
    }
  )
}
```

This ensures that all Supabase requests are authenticated with the user's Clerk session token.

## 💳 Clerk Billing Integration

Clerk Billing provides a seamless subscription management system with minimal setup effort.

### Pricing Table Implementation

The subscription page (`app/subscriptions/page.tsx`) demonstrates the simplicity of Clerk Billing:

```typescript
import { PricingTable } from "@clerk/nextjs";

const Subscription = () => {
  return (
    <main>
      <PricingTable />
    </main>
  );
};
```

### Key Benefits

- **Zero Configuration**: The `PricingTable` component handles pricing display, plan selection, and checkout flow
- **Automatic Management**: Subscription lifecycle, payment processing, and plan changes are managed by Clerk
- **Customizable**: Pricing plans are configured in the Clerk Dashboard, not in code
- **Responsive Design**: Built-in responsive layout that works on all devices

### Clerk Dashboard Configuration

Pricing plans and subscription features are configured in the Clerk Dashboard:

1. Navigate to Clerk Dashboard → Billing
2. Create pricing plans (Free, Pro, Enterprise)
3. Define subscription features (e.g., "3_active_companions", "10_active_companions")
4. Set pricing tiers and trial periods
5. Configure webhooks for subscription events

## 🛡️ Subscription Feature Enforcement

Converso implements robust subscription feature enforcement using Clerk's `has()` method to control access to premium features.

### The has() Method

The `has()` method from Clerk auth checks if a user has specific plans or features:

```typescript
const { userId, has } = await auth();

if(has({ plan: 'prime_learner' })) {
  // User has prime_learner plan - grant unlimited access
  return true;
} else if(has({ feature: "3_active_companions" })) {
  // User can create up to 3 companions
  limit = 3;
} else if(has({ feature: "10_active_companions" })) {
  // User can create up to 10 companions
  limit = 10;
}
```

### Permission Implementation

The `newCompanionPermissions()` function in `lib/actions/companion.actions.ts` demonstrates comprehensive subscription enforcement:

```typescript
export const newCompanionPermissions = async () => {
  const { userId, has } = await auth();
  const supabase = createSupabaseClient();

  let limit = 0;

  // Check for premium plan
  if(has({ plan: 'prime_learner' })) {
    return true; // Unlimited companions
  } 
  // Check for feature-based limits
  else if(has({ feature: "3_active_companions" })) {
    limit = 3;
  } else if(has({ feature: "10_active_companions" })) {
    limit = 10;
  }

  // Count current companions
  const { data, error } = await supabase
    .from('companions')
    .select('id', { count: 'exact' })
    .eq('author', userId)

  const companionCount = data?.length;

  // Enforce limits
  if(companionCount >= limit) {
    return false
  } else {
    return true;
  }
}
```

### UI Integration

The permission check is integrated into the UI in `app/companion/new/page.tsx`:

```typescript
const CompanionNew = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const canCreateCompanion = await newCompanionPermissions();

  return (
    <main>
      {canCreateCompanion ? (
        <CompanionForm />
      ) : (
        <article className="companion-limit">
          <h1>You've Reached Your Limit</h1>
          <Link href="/subscriptions">Upgrade My Plan</Link>
        </article>
      )}
    </main>
  );
};
```

### Best Practices for Subscription Enforcement

- **Server-Side Validation**: Always check permissions on the server, never rely solely on client-side checks
- **Graceful Degradation**: Provide clear upgrade paths when limits are reached
- **Real-Time Enforcement**: Check permissions before each protected action
- **User Communication**: Clearly communicate limits and benefits of upgrading
- **Flexible Limits**: Support both plan-based and feature-based access control

## ✨ Best Practices

Converso follows industry best practices throughout the codebase:

### Architecture & Organization

- **Separation of Concerns**: Clear separation between components, lib utilities, and server actions
- **Component-Based Architecture**: Reusable UI components with proper props interfaces
- **Server Actions**: Database operations use server actions for security and performance
- **TypeScript First**: Strong typing throughout with proper interfaces and type definitions

### Security

- **Environment Variables**: Sensitive data stored in environment variables, never committed to code
- **Server-Side Auth**: Authentication checks performed on the server for all protected operations
- **Token-Based Access**: Supabase integration uses Clerk session tokens for secure database access
- **Input Validation**: Form validation using Zod schemas with React Hook Form

### Performance

- **Image Optimization**: Next.js Image component for automatic image optimization
- **Font Optimization**: Using `next/font` for automatic font loading and optimization
- **Code Splitting**: Automatic code splitting with Next.js App Router
- **Bundle Optimization**: Sentry tree-shaking removes debug logging from production builds

### Error Handling

- **Sentry Integration**: Comprehensive error monitoring with Sentry
- **Graceful Error Boundaries**: Global error handling in `app/global-error.tsx`
- **User-Friendly Messages**: Clear error messages for better user experience
- **Logging**: Structured error logging for debugging and monitoring

### UI/UX

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: Proper semantic HTML and ARIA labels
- **Visual Feedback**: Loading states, animations, and transitions for better UX
- **Modern UI**: shadcn/ui components for consistent, beautiful design
- **Dark Mode Support**: Built-in dark mode with next-themes

### Code Quality

- **ESLint Configuration**: Strict linting rules for code consistency
- **Type Safety**: Comprehensive TypeScript coverage
- **Code Organization**: Logical file structure with clear naming conventions
- **Documentation**: Inline comments for complex logic
- **Git Best Practices**: Proper .gitignore for sensitive files and dependencies

### Database Design

- **Normalized Schema**: Well-structured Supabase database schema
- **Relationship Management**: Proper foreign key relationships
- **Query Optimization**: Efficient Supabase queries with proper indexing
- **Data Validation**: Server-side validation before database operations

### Development Experience

- **Hot Reload**: Fast development with Next.js hot module replacement
- **Type Safety**: TypeScript provides excellent IDE support and catch errors early
- **Component Library**: shadcn/ui for consistent, pre-built components
- **Environment Management**: Clear separation between development and production environments

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm install
- Clerk account with project configured
- Supabase project with database schema
- Vapi account with API key
- Sentry account (optional, for error monitoring)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lms_saas
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with the following variables:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
SENTRY_AUTH_TOKEN=your_sentry_token
SENTRY_DSN=your_sentry_dsn
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

Ensure your Supabase database has the following tables:
- `companions` (id, name, subject, topic, style, voice, author, created_at)
- `session_history` (id, companion_id, user_id, created_at)

### Clerk Configuration

1. Set up authentication in Clerk Dashboard
2. Configure billing plans and features
3. Set up webhooks for subscription events
4. Configure JWT templates for Supabase integration

## 📁 Project Structure

```
lms_saas/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   ├── companion/           # Companion-related pages
│   ├── my-journey/          # User journey page
│   ├── subscriptions/       # Subscription/billing page
│   ├── sign-in/            # Authentication pages
│   ├── layout.tsx          # Root layout with ClerkProvider
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/              # React components
│   ├── ui/                 # shadcn/ui components
│   ├── AICompanion.tsx     # Voice AI companion component
│   ├── CompanionForm.tsx   # Companion creation form
│   ├── Header.tsx          # Navigation header
│   └── ...                 # Other UI components
├── lib/                    # Utility functions and configurations
│   ├── actions/           # Server actions
│   ├── vapi.sdk.ts        # Vapi SDK initialization
│   ├── supabase.ts        # Supabase client setup
│   └── utils.ts           # Utility functions
├── constants/              # Application constants
│   └── index.ts           # Subjects, voices, colors
├── public/                 # Static assets
│   ├── images/            # Images and icons
│   └── icons/             # SVG icons
└── types/                 # TypeScript type definitions
```

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and submit pull requests for any improvements.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Vapi for the powerful voice AI platform
- Clerk for authentication and billing solutions
- Supabase for the excellent backend-as-a-service
- The Next.js team for the amazing framework
