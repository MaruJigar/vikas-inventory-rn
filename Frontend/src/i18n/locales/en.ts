/**
 * Source-of-truth resources. Leaf values are widened to `string` (no
 * `as const`) so the Hindi file must match the *shape* but not the literal
 * English text — TranslationResources enforces key parity across locales.
 */
export const en = {
  common: {
    appName: 'Qera',
    loading: 'Loading…',
    retry: 'Retry',
    cancel: 'Cancel',
    submit: 'Submit',
    continue: 'Continue',
    back: 'Back',
    language: 'Language',
    english: 'English',
    hindi: 'हिन्दी',
  },
  auth: {
    login: {
      title: 'Welcome back',
      subtitle: 'Sign in to continue',
      emailOrPhone: 'Email or phone',
      emailOrPhonePlaceholder: 'you@example.com or 9876543210',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      submit: 'Sign in',
      forgot: 'Forgot password?',
      noAccount: "Don't have an account?",
      register: 'Register',
    },
    roleSelect: {
      title: 'Create your account',
      subtitle: 'How will you use Qera?',
      salesman: 'I am a Salesman',
      salesmanDesc: 'Visit shops and place orders for a distributor',
      distributor: 'I am a Distributor',
      distributorDesc: 'Order stock from manufacturers and manage shops',
    },
    register: {
      salesmanTitle: 'Salesman registration',
      distributorTitle: 'Distributor registration',
      fullName: 'Full name',
      email: 'Email',
      phone: 'Phone',
      password: 'Password',
      distributorId: 'Distributor ID',
      businessName: 'Business name',
      gstNumber: 'GST number',
      submit: 'Create account',
      haveAccount: 'Already have an account?',
      signIn: 'Sign in',
      successTitle: 'Registration submitted',
      successMessage:
        'Your account is pending admin approval. You can sign in once approved.',
      goToLogin: 'Go to login',
    },
    forgot: {
      title: 'Reset password',
      subtitle: 'Enter your email or phone to receive an OTP',
      emailOrPhone: 'Email or phone',
      sendOtp: 'Send OTP',
      unavailable:
        'Password reset is not available yet. Please contact your administrator.',
      backToLogin: 'Back to login',
    },
    waiting: {
      title: 'Waiting for approval',
      message:
        'Your account is under review. You can start ordering once an admin approves you.',
      catalogHint: 'You can still browse catalogs and your profile.',
      rejectedTitle: 'Registration rejected',
      rejectedMessage:
        'Your registration was not approved. Please contact your administrator.',
      logout: 'Log out',
      refresh: 'Refresh status',
    },
  },
  validation: {
    required: 'This field is required',
    email: 'Enter a valid email',
    phone: 'Enter a valid 10-digit phone number',
    emailOrPhone: 'Email or phone is required',
    gst: 'Enter a valid 15-character GST number',
    passwordMin: 'Password must be at least 6 characters',
  },
  errors: {
    network: 'Network error. Cannot reach the server.',
    timeout: 'Connection timed out. Check your internet and retry.',
    invalidCredentials: 'Invalid email/phone or password.',
    generic: 'Something went wrong. Please try again.',
  },
};

export type TranslationResources = typeof en;
