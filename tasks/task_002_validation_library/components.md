# Component Requirements - Task 002: Validation Library Integration

## Components Involved

### 1. ValidationProvider.tsx
**Purpose:** Global validation context provider
**Type:** Provider Component

```typescript
interface ValidationContextValue {
  validateData: <T extends z.ZodSchema>(schema: T, data: unknown) => z.infer<T>;
  validateAsync: <T extends z.ZodSchema>(schema: T, data: unknown) => Promise<z.infer<T>>;
  formatError: (error: z.ZodError) => string[];
  clearError: (key: string) => void;
  errors: Record<string, string>;
}

export function ValidationProvider({ children }: { children: React.ReactNode }) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateData = React.useCallback(<T extends z.ZodSchema>(
    schema: T,
    data: unknown
  ): z.infer<T> => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const formattedErrors = formatZodError(result.error);
      setErrors(formattedErrors);
      throw new ValidationError('Validation failed', formattedErrors);
    }
    return result.data;
  }, []);

  const contextValue: ValidationContextValue = {
    validateData,
    validateAsync,
    formatError,
    clearError: (key) => setErrors(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    }),
    errors,
  };

  return (
    <ValidationContext.Provider value={contextValue}>
      {children}
    </ValidationContext.Provider>
  );
}
```

**Props:**
- children: React.ReactNode (required)

**State Requirements:**
- Current validation errors state
- Validation context state

---

### 2. FormField.tsx
**Purpose:** Reusable form field with validation
**Type:** Composite Component

```typescript
interface FormFieldProps {
  name: string;
  label: string;
  control: Control<any>;
  schema?: z.ZodSchema;
  type?: 'text' | 'email' | 'phone' | 'password' | 'number';
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export function FormField({
  name,
  label,
  control,
  schema,
  type = 'text',
  placeholder,
  keyboardType,
  secureTextEntry,
  multiline,
  numberOfLines,
}: FormFieldProps) {
  const {
    field: { onChange, onBlur, value },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: '',
  });

  const { formatError } = useValidation();

  // Validate on change if schema provided
  React.useEffect(() => {
    if (schema && value) {
      try {
        schema.parse(value);
      } catch (error) {
        // Error will be handled by fieldState
      }
    }
  }, [value, schema]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
        ]}
        onBlur={onBlur}
        onChangeText={onChange}
        value={value}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        accessibilityLabel={label}
      />
      {error && (
        <Text style={styles.errorText}>
          {error.message || formatError(error.error)}
        </Text>
      )}
    </View>
  );
}
```

**Props:**
- name: string (required)
- label: string (required)
- control: Control<any> (required)
- schema?: z.ZodSchema (optional)
- type?: 'text' | 'email' | 'phone' | 'password' | 'number' (optional)
- placeholder?: string (optional)
- keyboardType?: KeyboardTypeOptions (optional)
- secureTextEntry?: boolean (optional)
- multiline?: boolean (optional)
- numberOfLines?: number (optional)

**State Requirements:**
- Form control state
- Field state (touched, error)
- Validation error state

---

### 3. ValidationMessage.tsx
**Purpose:** Display validation errors
**Type:** Atomic Component

```typescript
interface ValidationMessageProps {
  error?: string;
  type?: 'error' | 'warning' | 'info';
  visible?: boolean;
}

export function ValidationMessage({
  error,
  type = 'error',
  visible = true,
}: ValidationMessageProps) {
  if (!visible || !error) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      styles[`container_${type}`],
    ]}>
      <Text style={styles[`text_${type}`]}>{error}</Text>
    </View>
  );
}
```

**Props:**
- error?: string (optional)
- type?: 'error' | 'warning' | 'info' (optional)
- visible?: boolean (optional)

**State Requirements:** None

---

### 4. useValidatedForm.ts
**Purpose:** Custom hook for validated forms
**Type:** Custom Hook

```typescript
export function useValidatedForm<T extends z.ZodSchema>(
  schema: T,
  options?: UseFormOptions<z.infer<T>>
) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    ...options,
  });

  const validateOnSubmit = React.useCallback(
    (data: z.infer<T>) => {
      const result = schema.safeParse(data);
      if (!result.success) {
        const errors = result.error.errors.reduce((acc, error) => {
          acc[error.path.join('.')] = error.message;
          return acc;
        }, {} as Record<string, string>);
        form.setError('root', { message: 'Validation failed' });
        return { success: false, errors };
      }
      return { success: true, data: result.data };
    },
    [schema, form]
  );

  return {
    ...form,
    validateOnSubmit,
  };
}
```

**Props:**
- schema: z.ZodSchema<T> (required)
- options?: UseFormOptions<z.infer<T>> (optional)

**State Requirements:**
- Form state
- Validation state
- Submit state

---

### 5. validateRouteParams.ts (Utility)
**Purpose:** Route parameter validation utility
**Type:** Utility Function

```typescript
export function validateRouteParams<T extends z.ZodSchema>(
  params: Record<string, any>,
  schema: T
): z.infer<T> {
  const result = schema.safeParse(params);

  if (!result.success) {
    const formattedErrors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    // Log for debugging
    console.error('Route param validation failed:', formattedErrors);

    // Redirect to not found or show error
    throw new Error(`Invalid route parameters: ${formattedErrors[0]?.message}`);
  }

  return result.data;
}

// Usage in screens
export default function SalonDetailScreen() {
  const { id } = useLocalSearchParams();

  // Validate route params
  const validatedParams = validateRouteParams(
    { id },
    idSchema
  );

  const salonId = validatedParams.id;

  // Use validated ID
  const { data } = useSalonDetail(salonId);

  return <SalonDetail salon={data} />;
}
```

**Params:**
- params: Record<string, any> (required)
- schema: z.ZodSchema<T> (required)

**Returns:** z.infer<T> (validated data)

## Component Hierarchy

```
AppProviders (Provider)
├── Redux Provider
├── QueryClient Provider
├── Auth Provider
├── Theme Provider
├── Validation Provider  ← NEW
│   ├── ValidationContext
│   └── Validation Utilities
└── RootLayout (Layout)
    ├── AuthGuard
    │   └── Protected Content
    └── FormField
        └── ValidationMessage
```

## Props and State Requirements

### Validation Context
```typescript
interface ValidationContextValue {
  validateData: <T>(schema: T, data: unknown) => z.infer<T>;
  validateAsync: <T>(schema: T, data: unknown) => Promise<z.infer<T>>;
  formatError: (error: z.ZodError) => string[];
  clearError: (key: string) => void;
  errors: Record<string, string>;
}
```

### Form State
```typescript
interface FormState {
  values: Record<string, any>;
  touched: Record<string, boolean>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValidating: boolean;
}
```

## Integration Requirements

### React Hook Form Integration
- Use zodResolver for schema-based validation
- Support async validation
- Handle form reset with validation
- Support conditional validation

### RTK Query Integration
- Transform all responses through schemas
- Handle validation errors in error boundaries
- Retry on validation failures
- Cache validated data

### Route Parameter Integration
- Validate all dynamic route params
- Redirect on invalid params
- Preserve query params during validation
- Deep link validation

## Reusable Components
These components should be available in `src/components/shared/validation/`:
- ValidationProvider
- FormField
- ValidationMessage
- useValidatedForm hook
- validateRouteParams utility

## Component Dependencies
- react-hook-form (Form management)
- zod (Validation schemas)
- zod-resolvers (Integration with react-hook-form)
- React (Hooks, Context)

## Validation Flow
1. **User Input** → FormField
2. **Schema Validation** → Zod + react-hook-form
3. **Error Display** → ValidationMessage
4. **API Request** → RTK Query
5. **Response Validation** → Zod schema transform
6. **Store Update** → Redux with validated data
