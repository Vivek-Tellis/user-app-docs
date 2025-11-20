# Component Requirements - Task 003: Authentication Core

## Components Involved

### 1. LoginScreen.tsx
**Purpose:** Main login screen with phone/email input
**Type:** Page-Level Component

**Component Hierarchy:**
```
LoginScreen
├── AuthHeader
├── Logo/Brand
├── LoginForm
│   ├── PhoneInput (with country code)
│   ├── ModeToggle (Login/Register)
│   └── SubmitButton
└── Footer
    ├── TermsLink
    └── PrivacyLink
```

**Props Interface:**
```typescript
interface LoginScreenProps {
  navigation?: NavigationProp<AuthStackParamList>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { sendOtp, isLoading } = useAuth();
  const [mode, setMode] = React.useState<'login' | 'register'>('login');

  const onSubmit = async (data: { phone: string }) => {
    await sendOtp(data.phone, mode);
    navigation?.navigate('Otp', { phone: data.phone, mode });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <AuthHeader />
        <Logo />
        <Text style={styles.title}>
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </Text>
        <LoginForm onSubmit={onSubmit} isLoading={isLoading} />
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
};
```

**State Requirements:**
- Form state (phone, isValid)
- Loading state
- Error state
- Mode (login/register)

---

### 2. OtpScreen.tsx
**Purpose:** OTP verification screen
**Type:** Page-Level Component

**Component Hierarchy:**
```
OtpScreen
├── AuthHeader
├── PhoneDisplay
├── OtpInput (6-digit)
├── CountdownTimer
├── ResendButton
└── SubmitButton
```

**Props Interface:**
```typescript
interface OtpScreenProps {
  route: RouteProp<AuthStackParamList, 'Otp'>;
  navigation?: NavigationProp<AuthStackParamList>;
}

const OtpScreen: React.FC<OtpScreenProps> = ({ route, navigation }) => {
  const { phone, mode } = route.params;
  const { verifyOtp, isLoading } = useAuth();

  const [otp, setOtp] = React.useState('');
  const [timeLeft, setTimeLeft] = React.useState(300); // 5 minutes

  const onSubmit = async () => {
    const result = await verifyOtp(phone, otp);
    if (result.success) {
      navigation?.replace('Main');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuthHeader />
      <PhoneDisplay phone={phone} />
      <Text style={styles.title}>Enter OTP</Text>
      <OtpInput
        value={otp}
        onChange={setOtp}
        length={6}
        onComplete={onSubmit}
      />
      <CountdownTimer timeLeft={timeLeft} />
      <ResendButton
        phone={phone}
        mode={mode}
        onResend={handleResend}
      />
    </SafeAreaView>
  );
};
```

**State Requirements:**
- OTP input state
- Countdown timer
- Loading state
- Error state

---

### 3. AuthHeader.tsx
**Purpose:** Shared header for authentication screens
**Type:** Atomic Component

**Props Interface:**
```typescript
interface AuthHeaderProps {
  showBack?: boolean;
  onBack?: () => void;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ showBack = false, onBack }) => {
  return (
    <View style={styles.header}>
      {showBack && (
        <TouchableOpacity onPress={onBack} accessibilityLabel="Go back">
          <Icon name="arrow-back" size={24} />
        </TouchableOpacity>
      )}
    </View>
  );
};
```

**Props:**
- showBack?: boolean (optional)
- onBack?: () => void (optional)

**State Requirements:** None

---

### 4. LoginForm.tsx
**Purpose:** Login form component with validation
**Type:** Composite Component

**Props Interface:**
```typescript
interface LoginFormProps {
  onSubmit: (data: { phone: string }) => void;
  isLoading?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(sendOtpRequestSchema),
    mode: 'onChange',
  });

  const handleFormSubmit = handleSubmit((data) => onSubmit(data));

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <PhoneInput
            value={value}
            onChangeText={onChange}
            placeholder="Enter phone number"
            error={errors.phone?.message}
          />
        )}
      />
      <Button
        title={isLoading ? 'Sending...' : 'Send OTP'}
        onPress={handleFormSubmit}
        disabled={!isValid || isLoading}
        loading={isLoading}
      />
    </View>
  );
};
```

**Props:**
- onSubmit: (data: { phone: string }) => void (required)
- isLoading?: boolean (optional)

**State Requirements:**
- Form control state
- Field errors
- Validation status

## Redux Store Integration

### Auth Slice State
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});
```

## API Integration

### RTK Query Endpoints
```typescript
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    sendOtp: builder.mutation<SendOtpResponse, SendOtpRequest>({
      query: (data) => ({
        url: '/auth/send_otp',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: unknown) => {
        return sendOtpResponseSchema.parse(response);
      },
    }),
    verifyOtpLogin: builder.mutation<LoginResponse, VerifyOtpRequest>({
      query: (data) => ({
        url: '/auth/verify_otp_login',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: unknown) => {
        return loginResponseSchema.parse(response);
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update auth state on successful login
          dispatch(setCredentials(data.data));
          // Store token securely
          await Keychain.setInternetCredentials(
            'authToken',
            'token',
            data.data.token
          );
        } catch (error) {
          dispatch(setError('Authentication failed'));
        }
      },
    }),
    getProfile: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
});
```

## Navigation Integration
```typescript
// app/(auth)/_layout.tsx
export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(app)/" />;
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="otp" options={{ headerShown: false }} />
    </Stack>
  );
}
```

## Component Dependencies
- react-hook-form (Form management)
- zod (Validation)
- Redux Toolkit (State)
- RTK Query (API)
- react-native-keychain (Secure storage)
- @react-native-async-storage/async-storage (Optional)
