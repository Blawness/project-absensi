# 🎨 UI/UX Guidelines & Component Library - Absensi Standalone

## 🎯 Design Philosophy

### Core Principles
1. **User-Centric**: Setiap desain dibuat untuk memudahkan pengguna
2. **Accessibility First**: Dapat diakses oleh semua pengguna
3. **Mobile-First**: Optimized untuk mobile devices
4. **Consistency**: Konsisten di seluruh aplikasi
5. **Performance**: Fast loading dan smooth interactions

### Design Goals
- **Intuitive**: Mudah dipahami tanpa training
- **Efficient**: Menyelesaikan task dengan minimal clicks
- **Reliable**: Konsisten dan predictable
- **Beautiful**: Modern dan professional

---

## 🎨 Design System

### Color Palette

#### Primary Colors
```css
/* Primary Blue */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Main Primary */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;

/* Success Green */
--success-50: #f0fdf4;
--success-100: #dcfce7;
--success-200: #bbf7d0;
--success-300: #86efac;
--success-400: #4ade80;
--success-500: #22c55e;  /* Main Success */
--success-600: #16a34a;
--success-700: #15803d;
--success-800: #166534;
--success-900: #14532d;

/* Warning Orange */
--warning-50: #fffbeb;
--warning-100: #fef3c7;
--warning-200: #fde68a;
--warning-300: #fcd34d;
--warning-400: #fbbf24;
--warning-500: #f59e0b;  /* Main Warning */
--warning-600: #d97706;
--warning-700: #b45309;
--warning-800: #92400e;
--warning-900: #78350f;

/* Error Red */
--error-50: #fef2f2;
--error-100: #fee2e2;
--error-200: #fecaca;
--error-300: #fca5a5;
--error-400: #f87171;
--error-500: #ef4444;   /* Main Error */
--error-600: #dc2626;
--error-700: #b91c1c;
--error-800: #991b1b;
--error-900: #7f1d1d;
```

#### Neutral Colors
```css
/* Gray Scale */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

### Typography

#### Font Stack
```css
/* Primary Font - Inter */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Monospace Font - JetBrains Mono */
font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

#### Typography Scale
```css
/* Headings */
--text-4xl: 2.25rem;    /* 36px - Page Title */
--text-3xl: 1.875rem;   /* 30px - Section Title */
--text-2xl: 1.5rem;     /* 24px - Card Title */
--text-xl: 1.25rem;     /* 20px - Subsection Title */
--text-lg: 1.125rem;    /* 18px - Large Text */

/* Body Text */
--text-base: 1rem;      /* 16px - Default Body */
--text-sm: 0.875rem;    /* 14px - Small Text */
--text-xs: 0.75rem;     /* 12px - Caption */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

#### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System

#### Spacing Scale (8px base)
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Border Radius
```css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-full: 9999px;   /* Fully rounded */
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
/* sm: 640px - Mobile Large */
@media (min-width: 640px) { ... }

/* md: 768px - Tablet */
@media (min-width: 768px) { ... }

/* lg: 1024px - Desktop */
@media (min-width: 1024px) { ... }

/* xl: 1280px - Large Desktop */
@media (min-width: 1280px) { ... }

/* 2xl: 1536px - Extra Large */
@media (min-width: 1536px) { ... }
```

### Grid System
```css
/* Container */
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

/* Responsive Container */
@media (min-width: 640px) { .container { max-width: 640px; } }
@media (min-width: 768px) { .container { max-width: 768px; } }
@media (min-width: 1024px) { .container { max-width: 1024px; } }
@media (min-width: 1280px) { .container { max-width: 1280px; } }
```

### Layout Patterns
```css
/* Flexbox Utilities */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

/* Grid Utilities */
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
```

---

## 🧩 Component Library

### 1. Buttons

#### Primary Button
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <Spinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
};
```

#### Button Variants
```tsx
// Primary Actions
<Button variant="primary">Check In</Button>
<Button variant="primary" size="lg">Check Out</Button>

// Secondary Actions
<Button variant="secondary">Cancel</Button>
<Button variant="outline">Edit</Button>

// Destructive Actions
<Button variant="danger">Delete</Button>

// Loading State
<Button loading>Processing...</Button>

// Disabled State
<Button disabled>Not Available</Button>
```

### 2. Forms

#### Input Field
```tsx
interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  helperText
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          ${error ? 'border-error-300 focus:ring-error-500 focus:border-error-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
        `}
      />
      {error && (
        <p className="text-sm text-error-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
```

#### Select Dropdown
```tsx
interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
  disabled = false,
  required = false
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          block w-full px-3 py-2 border rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          ${error ? 'border-error-300 focus:ring-error-500 focus:border-error-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-error-600">{error}</p>
      )}
    </div>
  );
};
```

### 3. Cards

#### Basic Card
```tsx
interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  actions,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex space-x-2">{actions}</div>
            )}
          </div>
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </div>
  );
};
```

#### Attendance Card
```tsx
const AttendanceCard: React.FC<{
  user: User;
  record: AbsensiRecord;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
}> = ({ user, record, onCheckIn, onCheckOut }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-success-600 bg-success-50';
      case 'late': return 'text-warning-600 bg-warning-50';
      case 'absent': return 'text-error-600 bg-error-50';
      case 'half_day': return 'text-warning-600 bg-warning-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-medium text-gray-900 truncate">
            {user.name}
          </h4>
          <p className="text-sm text-gray-500">{user.position}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
              {record.status.replace('_', ' ').toUpperCase()}
            </span>
            {record.workHours && (
              <span className="text-sm text-gray-600">
                {record.workHours}h worked
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {!record.checkInTime && onCheckIn && (
            <Button size="sm" onClick={onCheckIn}>
              Check In
            </Button>
          )}
          {record.checkInTime && !record.checkOutTime && onCheckOut && (
            <Button size="sm" variant="outline" onClick={onCheckOut}>
              Check Out
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
```

### 4. Tables

#### Data Table
```tsx
interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  sortKey?: keyof T;
  sortDirection?: 'asc' | 'desc';
}

const DataTable = <T,>({
  data,
  columns,
  loading = false,
  onSort,
  sortKey,
  sortDirection
}: DataTableProps<T>) => {
  const handleSort = (key: keyof T) => {
    if (!onSort) return;
    const direction = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, direction);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`
                  px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
                `}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <SortIcon
                      direction={
                        sortKey === column.key ? sortDirection : undefined
                      }
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render
                    ? column.render(row[column.key], row)
                    : String(row[column.key] || '-')
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### 5. Modals

#### Modal Component
```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className={`
          inline-block w-full ${sizeClasses[size]} p-6 my-8 overflow-hidden text-left align-middle
          transition-all transform bg-white shadow-xl rounded-lg
        `}>
          {title && (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};
```

### 6. Loading States

#### Spinner
```tsx
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`animate-spin ${sizeClasses[size]} ${className}`}>
      <svg className="w-full h-full text-primary-600" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};
```

#### Skeleton Loader
```tsx
const SkeletonCard: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 📱 Mobile Optimization

### Touch Targets
```css
/* Minimum touch target size: 44px */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Button touch targets */
.btn-mobile {
  padding: 12px 16px;
  min-height: 44px;
}
```

### Mobile Navigation
```tsx
const MobileNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
          <nav className="px-4 py-2 space-y-1">
            <a href="/dashboard" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md">
              Dashboard
            </a>
            <a href="/attendance" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md">
              Attendance
            </a>
            <a href="/reports" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md">
              Reports
            </a>
          </nav>
        </div>
      )}
    </>
  );
};
```

### Swipe Gestures
```tsx
const SwipeableCard: React.FC<{
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}> = ({ children, onSwipeLeft, onSwipeRight }) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const deltaX = currentX - startX;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    setIsDragging(false);
    setCurrentX(0);
  };

  return (
    <div
      className="touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};
```

---

## ♿ Accessibility Guidelines

### WCAG 2.1 AA Compliance

#### Color Contrast
- **Normal text**: 4.5:1 contrast ratio
- **Large text**: 3:1 contrast ratio
- **UI components**: 3:1 contrast ratio

#### Keyboard Navigation
```tsx
// Focus management
const useFocusManagement = () => {
  const focusRef = useRef<HTMLDivElement>(null);

  const focusFirstElement = () => {
    const firstFocusable = focusRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    firstFocusable?.focus();
  };

  return { focusRef, focusFirstElement };
};

// Skip links
const SkipLink: React.FC = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50"
  >
    Skip to main content
  </a>
);
```

#### Screen Reader Support
```tsx
// ARIA labels
<button
  aria-label="Check in to work"
  aria-describedby="checkin-help"
  className="btn-primary"
>
  Check In
</button>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {statusMessage}
</div>

// Form labels
<label htmlFor="email-input" className="block text-sm font-medium text-gray-700">
  Email Address
</label>
<input
  id="email-input"
  type="email"
  aria-required="true"
  aria-describedby="email-error"
/>
```

### Semantic HTML
```tsx
// Proper heading hierarchy
<main>
  <h1>Dashboard</h1>
  <section>
    <h2>Today's Attendance</h2>
    <article>
      <h3>John Doe - Present</h3>
    </article>
  </section>
</main>

// Form structure
<form role="form" aria-labelledby="login-title">
  <h2 id="login-title">Login</h2>
  <fieldset>
    <legend>Login Credentials</legend>
    <div className="form-group">
      <label htmlFor="email">Email</label>
      <input id="email" type="email" required />
    </div>
  </fieldset>
</form>
```

---

## 🎨 Animation & Transitions

### Transition Classes
```css
/* Fade transitions */
.fade-enter {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
}

.fade-exit {
  opacity: 1;
  transform: translateY(0);
}

.fade-exit-active {
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
}

/* Scale transitions */
.scale-enter {
  opacity: 0;
  transform: scale(0.95);
}

.scale-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}

/* Slide transitions */
.slide-enter {
  transform: translateX(-100%);
}

.slide-enter-active {
  transform: translateX(0);
  transition: transform 300ms ease-in-out;
}
```

### Micro-interactions
```tsx
// Button hover effects
const AnimatedButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      className="transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
      {...props}
    >
      {children}
    </button>
  );
};

// Loading states
const LoadingButton: React.FC<ButtonProps & { loading: boolean }> = ({
  loading,
  children,
  ...props
}) => {
  return (
    <button
      className="relative overflow-hidden"
      disabled={loading}
      {...props}
    >
      <span className={`transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" />
        </span>
      )}
    </button>
  );
};
```

---

## 📊 Data Visualization

### Charts & Graphs
```tsx
// Attendance Chart Component
const AttendanceChart: React.FC<{
  data: AttendanceData[];
  type: 'line' | 'bar' | 'pie';
}> = ({ data, type }) => {
  const chartConfig = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Attendance Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="h-64">
        {type === 'line' && <Line data={data} options={chartConfig} />}
        {type === 'bar' && <Bar data={data} options={chartConfig} />}
        {type === 'pie' && <Pie data={data} options={chartConfig} />}
      </div>
    </div>
  );
};
```

### Progress Indicators
```tsx
const ProgressBar: React.FC<{
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
}> = ({ value, max = 100, label, showPercentage = true }) => {
  const percentage = (value / max) * 100;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-gray-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
```

---

## 🎯 Design Tokens

### Design Token System
```typescript
// Design tokens for consistent theming
export const designTokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      900: '#1e3a8a',
    },
    // ... other colors
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
} as const;
```

---

*Dokumen ini akan diperbarui sesuai dengan perubahan design system dan feedback dari design team.*


