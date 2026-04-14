# Statistics Module - Frontend

Comprehensive statistics and analytics dashboard for ClubManager V3.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Components](#components)
- [Hooks](#hooks)
- [API Integration](#api-integration)
- [Routing](#routing)
- [Styling](#styling)
- [Testing](#testing)

## 🎯 Overview

The Statistics module provides a complete analytics dashboard for club management, offering insights into:

- **Member Analytics**: Member growth, demographics, grade distribution
- **Course Analytics**: Attendance rates, popular courses, trends
- **Financial Analytics**: Revenue tracking, payment status, late payments
- **Store Analytics**: Sales performance, popular products, inventory alerts
- **Trend Analytics**: Historical data visualization and growth metrics

## ✨ Features

- 📊 **Real-time Statistics**: Live data from the backend API
- 📈 **Interactive Charts**: Visual representation of data trends
- 🔍 **Flexible Filtering**: Date range and period selection
- 📱 **Responsive Design**: Mobile-friendly layouts
- ⚡ **Performance Optimized**: React Query caching and prefetching
- 🎨 **PatternFly UI**: Consistent design system

## 🏗️ Architecture

```
features/statistics/
├── components/          # Reusable UI components
│   ├── StatCard.tsx           # Metric display card
│   ├── PeriodSelector.tsx     # Date range picker
│   ├── MemberStats.tsx        # Member analytics component
│   ├── CourseStats.tsx        # Course analytics component
│   ├── FinanceStats.tsx       # Financial analytics component
│   ├── StoreStats.tsx         # Store analytics component
│   └── TrendChart.tsx         # Trend visualization
├── hooks/              # Custom React hooks
│   └── useStatistics.ts       # Data fetching hooks
├── pages/              # Page components
│   ├── DashboardPage.tsx      # Main dashboard
│   ├── MembersStatsPage.tsx   # Member details
│   ├── CoursesStatsPage.tsx   # Course details
│   ├── FinanceStatsPage.tsx   # Finance details
│   └── StoreStatsPage.tsx     # Store details
├── api/                # API client functions
│   └── statistics.api.ts      # HTTP requests
├── stores/             # Zustand state management
│   └── filtersStore.ts        # Filter state
├── utils/              # Utility functions
│   └── formatting.ts          # Data formatters
├── StatisticsRouter.tsx       # Route configuration
└── index.ts            # Module exports
```

## 📦 Installation

The module is part of the ClubManager V3 monorepo and uses shared types:

```bash
# From the root directory
pnpm install

# The module depends on:
# - @clubmanager/types (workspace package)
# - @tanstack/react-query
# - @patternfly/react-core
# - @patternfly/react-charts
# - react-router-dom
# - zustand
```

## 🚀 Usage

### Basic Integration

Add the statistics router to your main application:

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StatisticsRouter } from './features/statistics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/statistics/*" element={<StatisticsRouter />} />
        {/* Other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

### Using Individual Pages

```tsx
import { DashboardPage } from './features/statistics';

function CustomLayout() {
  return (
    <div>
      <DashboardPage />
    </div>
  );
}
```

### Using Hooks

```tsx
import { useDashboardAnalytics } from './features/statistics';

function MyComponent() {
  const { data, isLoading, error } = useDashboardAnalytics();

  if (isLoading) return <Spinner />;
  if (error) return <Alert>{error.message}</Alert>;

  return (
    <div>
      <h1>Total Members: {data.members.overview.total_membres}</h1>
      <h2>Revenue: {formatCurrency(data.finance.overview.total_revenus)}</h2>
    </div>
  );
}
```

## 🧩 Components

### StatCard

Displays a single statistic with optional trend indicator.

```tsx
import { StatCard } from './features/statistics';

<StatCard
  title="Total Members"
  value={formatNumber(150)}
  subtitle="+12% this month"
  icon={UsersIcon}
  variant="primary"
  trend={{ value: 12, isPositive: true }}
/>
```

**Props:**
- `title` (string): Card title
- `value` (string | number): Main value to display
- `subtitle?` (string): Optional subtitle
- `icon?` (Component): PatternFly icon component
- `variant?` ('primary' | 'success' | 'warning' | 'danger' | 'info' | 'default')
- `trend?` ({ value: number, isPositive: boolean }): Trend indicator

### PeriodSelector

Date range and period type selector for filtering analytics.

```tsx
import { PeriodSelector } from './features/statistics';

<PeriodSelector />
```

Automatically syncs with the filters store and updates all statistics queries.

### MemberStats

Complete member analytics visualization.

```tsx
import { MemberStats } from './features/statistics';
import { useMemberAnalytics } from './features/statistics';

function MembersPage() {
  const { data } = useMemberAnalytics();
  
  return <MemberStats data={data} />;
}
```

**Features:**
- Member overview (total, active, inactive)
- Grade distribution pie chart
- Gender distribution chart
- Age group breakdown
- Growth trends

### CourseStats

Course attendance and participation analytics.

```tsx
import { CourseStats } from './features/statistics';

<CourseStats data={courseData} />
```

**Features:**
- Attendance rate visualization
- Popular courses list
- Attendance by day of week
- Course type breakdown

### FinanceStats

Financial analytics and revenue tracking.

```tsx
import { FinanceStats } from './features/statistics';

<FinanceStats data={financeData} />
```

**Features:**
- Revenue overview
- Payment method breakdown
- Subscription plan analysis
- Late payment alerts

### StoreStats

Store and sales performance analytics.

```tsx
import { StoreStats } from './features/statistics';

<StoreStats data={storeData} />
```

**Features:**
- Order statistics
- Top selling products
- Sales by category
- Inventory alerts

### TrendChart

Customizable trend visualization chart.

```tsx
import { TrendChart } from './features/statistics';

<TrendChart
  title="Member Growth"
  data={trendData}
  type="line"
  color="primary"
  showLegend={true}
/>
```

**Props:**
- `title` (string): Chart title
- `data` (TrendDataPoint[]): Array of data points
- `type?` ('line' | 'bar' | 'area'): Chart type
- `color?` (string): Chart color scheme
- `showLegend?` (boolean): Display legend

## 🪝 Hooks

### useDashboardAnalytics

Fetches complete dashboard analytics.

```tsx
const { data, isLoading, error, refetch } = useDashboardAnalytics(params?, enabled?);
```

**Parameters:**
- `params?` (AnalyticsParams): Optional date range and period override
- `enabled?` (boolean): Enable/disable query (default: true)

**Returns:**
- `data` (DashboardAnalytics): Complete dashboard data
- `isLoading` (boolean): Loading state
- `error` (Error | null): Error object if failed
- `refetch` (function): Manual refetch function

### useMemberAnalytics

Fetches member-specific analytics.

```tsx
const { data } = useMemberAnalytics();
```

Returns `MemberAnalyticsResponse` with member statistics.

### useCourseAnalytics

Fetches course and attendance analytics.

```tsx
const { data } = useCourseAnalytics();
```

Returns `CourseAnalyticsResponse` with course statistics.

### useFinancialAnalytics

Fetches financial and payment analytics.

```tsx
const { data } = useFinancialAnalytics();
```

Returns `FinancialAnalyticsResponse` with financial statistics.

### useStoreAnalytics

Fetches store and sales analytics.

```tsx
const { data } = useStoreAnalytics();
```

Returns `StoreAnalyticsResponse` with store statistics.

### useTrendAnalytics

Fetches trend data over time.

```tsx
const { data } = useTrendAnalytics();
```

Returns `TrendAnalyticsResponse` with historical trends.

### useInvalidateStatistics

Invalidates all statistics cache.

```tsx
const invalidate = useInvalidateStatistics();

const handleRefresh = async () => {
  await invalidate();
};
```

### usePrefetchStatistics

Prefetch statistics for optimistic loading.

```tsx
const { prefetchDashboard, prefetchMembers } = usePrefetchStatistics();

const handleMouseEnter = () => {
  prefetchDashboard(); // Prefetch on hover
};
```

## 🌐 API Integration

### API Client

The module uses a centralized API client:

```typescript
// statistics.api.ts
export interface AnalyticsParams {
  date_debut?: Date;
  date_fin?: Date;
  period_type?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  include_trends?: boolean;
}

export const getDashboardAnalytics = async (
  params?: AnalyticsParams
): Promise<DashboardAnalytics> => {
  const response = await api.get('/statistics/dashboard', { params });
  return response.data;
};
```

### API Endpoints

All endpoints are relative to `/api/statistics`:

- `GET /dashboard` - Complete dashboard analytics
- `GET /members` - Member analytics
- `GET /courses` - Course analytics
- `GET /finance` - Financial analytics
- `GET /store` - Store analytics
- `GET /trends` - Trend analytics

### Query Parameters

```typescript
{
  date_debut?: string;    // ISO date string
  date_fin?: string;      // ISO date string
  period_type?: string;   // 'day' | 'week' | 'month' | 'quarter' | 'year'
  include_trends?: boolean;
}
```

## 🛣️ Routing

### Route Structure

```
/statistics
├── /dashboard       (Default - Overview)
├── /members         (Member details)
├── /courses         (Course details)
├── /finance         (Finance details)
└── /store           (Store details)
```

### Navigation Example

```tsx
import { Link } from 'react-router-dom';

<Link to="/statistics/dashboard">Dashboard</Link>
<Link to="/statistics/members">Members</Link>
<Link to="/statistics/courses">Courses</Link>
<Link to="/statistics/finance">Finance</Link>
<Link to="/statistics/store">Store</Link>
```

## 🎨 Styling

The module uses PatternFly components with consistent theming:

### Color Variants

- `primary` - Blue (#0066CC)
- `success` - Green (#3E8635)
- `warning` - Orange (#F0AB00)
- `danger` - Red (#C9190B)
- `info` - Cyan (#009596)
- `default` - Gray (#6A6E73)

### Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1200px
- Desktop: > 1200px

### Custom Styling

```tsx
import './custom.css';

<StatCard className="custom-stat-card" />
```

## 🧪 Testing

### Unit Tests

```tsx
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

test('renders stat card with value', () => {
  render(<StatCard title="Test" value={100} />);
  expect(screen.getByText('100')).toBeInTheDocument();
});
```

### Integration Tests

```tsx
import { renderHook } from '@testing-library/react-hooks';
import { useDashboardAnalytics } from './hooks/useStatistics';

test('fetches dashboard analytics', async () => {
  const { result, waitFor } = renderHook(() => useDashboardAnalytics());
  
  await waitFor(() => result.current.isSuccess);
  
  expect(result.current.data).toBeDefined();
});
```

### Mocking API Responses

```tsx
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/statistics/dashboard', (req, res, ctx) => {
    return res(ctx.json({ /* mock data */ }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 📝 Best Practices

1. **Always handle loading and error states**
   ```tsx
   if (isLoading) return <Skeleton />;
   if (error) return <Alert variant="danger">{error.message}</Alert>;
   if (!data) return <EmptyState />;
   ```

2. **Use the filters store for consistent filtering**
   ```tsx
   import { useStatisticsParams } from './stores/filtersStore';
   const params = useStatisticsParams();
   ```

3. **Format data consistently**
   ```tsx
   import { formatCurrency, formatNumber, formatPercentage } from './utils/formatting';
   ```

4. **Prefetch data for better UX**
   ```tsx
   const { prefetchMembers } = usePrefetchStatistics();
   <Link onMouseEnter={prefetchMembers}>Members</Link>
   ```

5. **Invalidate cache after mutations**
   ```tsx
   const invalidate = useInvalidateStatistics();
   await updateMember();
   await invalidate();
   ```

## 🔧 Configuration

### Environment Variables

```bash
VITE_API_URL=http://localhost:3001/api
VITE_ENABLE_QUERY_DEVTOOLS=true
```

### React Query Configuration

Query defaults are configured in the hooks:

```typescript
const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000,     // 5 minutes
  gcTime: 10 * 60 * 1000,       // 10 minutes
  retry: 2,
  refetchOnWindowFocus: false,
};
```

## 📚 Resources

- [TypeScript Types](../../packages/types/src/validators/statistics/)
- [Backend API](../../backend/src/modules/statistics/)
- [PatternFly Documentation](https://www.patternfly.org/)
- [React Query Documentation](https://tanstack.com/query/latest)

## 🤝 Contributing

When adding new statistics:

1. Add types to `packages/types/src/validators/statistics/analytics.validators.ts`
2. Update backend repository and use cases
3. Add new API endpoint in `api/statistics.api.ts`
4. Create new hook in `hooks/useStatistics.ts`
5. Build UI components
6. Add page if needed
7. Update routing
8. Write tests

## 📄 License

Part of ClubManager V3 - MIT License