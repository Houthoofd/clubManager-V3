# 🔧 GUIDE DE REFACTORISATION AVANCÉ - CLUBMANAGER V3

**Version :** 1.0  
**Date :** 2024  
**Statut :** Guide de référence pour amélioration continue  

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture Patterns](#architecture-patterns)
3. [State Management Optimization](#state-management-optimization)
4. [Custom Hooks Best Practices](#custom-hooks-best-practices)
5. [Component Composition](#component-composition)
6. [Performance Patterns](#performance-patterns)
7. [Code Organization](#code-organization)
8. [Type Safety](#type-safety)
9. [Error Handling](#error-handling)
10. [Testing Strategy](#testing-strategy)
11. [Accessibility](#accessibility)
12. [Plan d'Action](#plan-daction)

---

## 🎯 VUE D'ENSEMBLE

### Objectifs de la refactorisation

- ✅ **Maintenabilité** : Code plus facile à comprendre et modifier
- ✅ **Performance** : Optimisations runtime et build
- ✅ **Scalabilité** : Architecture qui grandit avec l'application
- ✅ **Qualité** : Moins de bugs, meilleure DX
- ✅ **Accessibilité** : Application utilisable par tous

### État actuel

| Aspect | Score | Commentaire |
|--------|-------|-------------|
| Architecture | 85% | Bonne structure, quelques améliorations possibles |
| State Management | 80% | Zustand bien utilisé, optimisations possibles |
| Components | 90% | Design system solide, composition à améliorer |
| Performance | 75% | Optimisations low-hanging fruits disponibles |
| Type Safety | 85% | TypeScript bien utilisé, quelques `any` à typer |
| Testing | 40% | Tests insuffisants, à développer |
| Accessibility | 60% | Bases présentes, à renforcer |

---

## 🏗️ ARCHITECTURE PATTERNS

### 1. Feature-First Organization ✅ ACTUEL

**État actuel (bon) :**
```
frontend/src/features/
├── users/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── stores/
│   └── api/
```

**Améliorations suggérées :**

```
frontend/src/features/
├── users/
│   ├── components/
│   │   ├── UserCard/
│   │   │   ├── UserCard.tsx
│   │   │   ├── UserCard.test.tsx
│   │   │   ├── UserCard.stories.tsx
│   │   │   └── index.ts
│   ├── pages/
│   ├── hooks/
│   ├── stores/
│   ├── api/
│   ├── types/           # ← Nouveau : types spécifiques
│   ├── utils/           # ← Nouveau : helpers feature
│   ├── constants.ts     # ← Nouveau : constantes feature
│   └── index.ts         # ← Nouveau : barrel export
```

### 2. Separation of Concerns

#### ❌ AVANT (mixing concerns)

```tsx
// UsersPage.tsx
const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {loading ? <Spinner /> : (
        <table>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>
                <button onClick={() => {
                  fetch(`/api/users/${user.id}`, { method: 'DELETE' })
                    .then(() => setUsers(users.filter(u => u.id !== user.id)));
                }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </table>
      )}
    </div>
  );
};
```

#### ✅ APRÈS (separated concerns)

```tsx
// hooks/useUsers.ts
export const useUsers = () => {
  const store = useUserStore();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', store.filters],
    queryFn: () => userApi.getUsers(store.filters),
  });

  const deleteMutation = useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
  });

  return {
    users: data?.items ?? [],
    isLoading,
    error,
    deleteUser: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};

// components/UsersTable.tsx
export const UsersTable = ({ users, onDelete, isDeleting }: UsersTableProps) => (
  <DataTable
    columns={columns}
    data={users}
    actions={(user) => (
      <IconButton
        icon={TrashIcon}
        onClick={() => onDelete(user.id)}
        loading={isDeleting}
        variant="danger"
      />
    )}
  />
);

// pages/UsersPage.tsx
export const UsersPage = () => {
  const { users, isLoading, deleteUser, isDeleting } = useUsers();

  if (isLoading) return <LoadingSpinner />;

  return (
    <PageLayout>
      <PageHeader title="Users" />
      <UsersTable 
        users={users} 
        onDelete={deleteUser}
        isDeleting={isDeleting}
      />
    </PageLayout>
  );
};
```

### 3. Dependency Injection Pattern

#### ❌ AVANT (tight coupling)

```tsx
const UserProfile = ({ userId }: { userId: number }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Hard-coded API call
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser);
  }, [userId]);

  return <div>{user?.name}</div>;
};
```

#### ✅ APRÈS (dependency injection)

```tsx
// api/userApi.ts
export const userApi = {
  getUser: (id: number) => apiClient.get<User>(`/users/${id}`),
  // ... autres méthodes
};

// hooks/useUser.ts
export const useUser = (
  userId: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.getUser(userId),
    enabled: options?.enabled ?? true,
  });
};

// UserProfile.tsx
const UserProfile = ({ userId }: { userId: number }) => {
  const { data: user, isLoading } = useUser(userId);

  if (isLoading) return <Skeleton />;
  return <div>{user?.name}</div>;
};

// Pour les tests, on peut facilement mocker
// test/UserProfile.test.tsx
vi.mock('../api/userApi', () => ({
  userApi: {
    getUser: vi.fn(() => Promise.resolve(mockUser)),
  },
}));
```

---

## 🗄️ STATE MANAGEMENT OPTIMIZATION

### 1. Zustand Store Optimization

#### ❌ AVANT (tout dans un gros store)

```tsx
// userStore.ts
export const useUserStore = create<UserState>((set) => ({
  // State
  users: [],
  loading: false,
  error: null,
  selectedUser: null,
  filters: {},
  pagination: {},
  
  // 20+ actions dans le même store...
  fetchUsers: async () => { /* ... */ },
  updateUser: async () => { /* ... */ },
  deleteUser: async () => { /* ... */ },
  // ... etc
}));
```

#### ✅ APRÈS (stores modulaires avec slices)

```tsx
// stores/userStore.ts
type UserSlice = {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
};

const createUserSlice: StateCreator<UserSlice> = (set) => ({
  users: [],
  isLoading: false,
  error: null,
  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const users = await userApi.getUsers();
      set({ users, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
});

// stores/userFiltersStore.ts
type FiltersSlice = {
  filters: UserFilters;
  setFilter: (key: string, value: any) => void;
  resetFilters: () => void;
};

const createFiltersSlice: StateCreator<FiltersSlice> = (set) => ({
  filters: initialFilters,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  resetFilters: () => set({ filters: initialFilters }),
});

// stores/index.ts
export const useUserStore = create<UserSlice & FiltersSlice>()(
  (...args) => ({
    ...createUserSlice(...args),
    ...createFiltersSlice(...args),
  })
);
```

### 2. Selective Subscriptions (éviter re-renders)

#### ❌ AVANT (re-render à chaque changement)

```tsx
const UserList = () => {
  // Tout le store est souscrit !
  const store = useUserStore();
  
  // Re-render même si seuls les filtres changent
  return (
    <div>
      {store.users.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  );
};
```

#### ✅ APRÈS (sélecteurs optimisés)

```tsx
// hooks/useUserSelectors.ts
export const useUsers = () => 
  useUserStore((state) => state.users);

export const useUserFilters = () =>
  useUserStore((state) => state.filters);

export const useUserActions = () =>
  useUserStore((state) => ({
    fetchUsers: state.fetchUsers,
    updateUser: state.updateUser,
    deleteUser: state.deleteUser,
  }), shallow); // shallow comparison pour les objets

// UserList.tsx
const UserList = () => {
  // Ne re-render que si users change
  const users = useUsers();
  
  return (
    <div>
      {users.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  );
};

// UserFilters.tsx
const UserFilters = () => {
  // Ne re-render que si filters change
  const filters = useUserFilters();
  const { setFilter } = useUserActions();
  
  return <FilterBar filters={filters} onChange={setFilter} />;
};
```

### 3. Persistence Strategy

```tsx
// stores/persistedStore.ts
import { persist, createJSONStorage } from 'zustand/middleware';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'fr',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => localStorage),
      // Sélectionner uniquement ce qui doit être persisté
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        // Ne PAS persister les fonctions ou données sensibles
      }),
    }
  )
);
```

---

## 🎣 CUSTOM HOOKS BEST PRACTICES

### 1. Hook Composition

#### ❌ AVANT (hook monolithique)

```tsx
export const useUserManagement = (userId: number) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  
  // 100+ lignes de logique...
  
  return { user, loading, error, editing, formData, /* ... */ };
};
```

#### ✅ APRÈS (hooks composables)

```tsx
// hooks/useUser.ts
export const useUser = (userId: number) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.getUser(userId),
  });
};

// hooks/useUserForm.ts
export const useUserForm = (initialData?: User) => {
  const form = useForm<UserFormData>({
    defaultValues: initialData,
    resolver: zodResolver(userSchema),
  });
  
  return form;
};

// hooks/useUserMutations.ts
export const useUserMutations = () => {
  const queryClient = useQueryClient();
  
  const updateMutation = useMutation({
    mutationFn: userApi.updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
  
  return { updateMutation, deleteMutation };
};

// Utilisation (composition)
const UserProfile = ({ userId }: { userId: number }) => {
  const { data: user, isLoading } = useUser(userId);
  const form = useUserForm(user);
  const { updateMutation } = useUserMutations();
  
  const onSubmit = (data: UserFormData) => {
    updateMutation.mutate({ id: userId, ...data });
  };
  
  // Logique simple et claire
};
```

### 2. Generic Hooks Pattern

```tsx
// hooks/useApi.ts
export const useApi = <TData, TError = Error>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: UseQueryOptions<TData, TError>
) => {
  return useQuery<TData, TError>({
    queryKey,
    queryFn,
    ...options,
  });
};

// hooks/usePaginatedApi.ts
export const usePaginatedApi = <TItem>(
  endpoint: string,
  filters: Record<string, any>
) => {
  const [page, setPage] = useState(1);
  
  const { data, isLoading } = useApi(
    [endpoint, filters, page],
    () => apiClient.get<PaginatedResponse<TItem>>(endpoint, {
      params: { ...filters, page },
    })
  );
  
  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    page,
    setPage,
    isLoading,
  };
};

// Utilisation
const UsersPage = () => {
  const { items, total, page, setPage, isLoading } = usePaginatedApi<User>(
    '/users',
    { status: 'active' }
  );
};
```

### 3. Debounce & Throttle Hooks

```tsx
// hooks/useDebounce.ts
export const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// hooks/useThrottle.ts
export const useThrottle = <T>(value: T, interval: number = 300): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + interval) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timerId = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval);

      return () => clearTimeout(timerId);
    }
  }, [value, interval]);

  return throttledValue;
};

// Utilisation
const SearchBar = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  
  const { data } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: () => searchApi(debouncedSearch),
    enabled: debouncedSearch.length > 2,
  });
};
```

---

## 🧩 COMPONENT COMPOSITION

### 1. Compound Components Pattern

#### ❌ AVANT (props explosion)

```tsx
<Modal
  isOpen={isOpen}
  title="Edit User"
  subtitle="Update user information"
  size="lg"
  closeOnOverlay={true}
  showFooter={true}
  primaryAction="Save"
  secondaryAction="Cancel"
  onPrimaryClick={handleSave}
  onSecondaryClick={handleCancel}
  primaryLoading={isSaving}
>
  {/* content */}
</Modal>
```

#### ✅ APRÈS (composition)

```tsx
<Modal isOpen={isOpen} onClose={handleClose} size="lg">
  <Modal.Header 
    title="Edit User"
    subtitle="Update user information"
  />
  <Modal.Body>
    {/* content */}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="outline" onClick={handleCancel}>
      Cancel
    </Button>
    <SubmitButton onClick={handleSave} isLoading={isSaving}>
      Save
    </SubmitButton>
  </Modal.Footer>
</Modal>
```

### 2. Render Props Pattern

```tsx
// components/UserList.tsx
type UserListProps = {
  users: User[];
  renderUser: (user: User) => ReactNode;
  renderEmpty?: () => ReactNode;
  renderLoading?: () => ReactNode;
  isLoading?: boolean;
};

export const UserList = ({
  users,
  renderUser,
  renderEmpty,
  renderLoading,
  isLoading,
}: UserListProps) => {
  if (isLoading && renderLoading) {
    return <>{renderLoading()}</>;
  }

  if (users.length === 0 && renderEmpty) {
    return <>{renderEmpty()}</>;
  }

  return (
    <div className="space-y-4">
      {users.map(renderUser)}
    </div>
  );
};

// Utilisation
<UserList
  users={users}
  isLoading={isLoading}
  renderUser={(user) => (
    <UserCard 
      key={user.id}
      user={user}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )}
  renderEmpty={() => (
    <EmptyState
      title="No users found"
      description="Try adjusting your filters"
    />
  )}
  renderLoading={() => <LoadingSpinner />}
/>
```

### 3. Higher-Order Components (HOC)

```tsx
// hocs/withAuth.tsx
export const withAuth = <P extends object>(
  Component: ComponentType<P>,
  requiredRole?: UserRole
) => {
  return (props: P) => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!isLoading && !user) {
        navigate('/login');
      }
      if (!isLoading && requiredRole && !hasRole(user, requiredRole)) {
        navigate('/unauthorized');
      }
    }, [user, isLoading, navigate]);

    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
};

// Utilisation
export const AdminPage = withAuth(
  () => <div>Admin Content</div>,
  'admin'
);
```

### 4. Polymorphic Components

```tsx
// components/Button/Button.tsx
type PolymorphicButtonProps<C extends React.ElementType> = {
  as?: C;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
} & React.ComponentPropsWithoutRef<C>;

export const Button = <C extends React.ElementType = 'button'>({
  as,
  children,
  variant = 'primary',
  ...props
}: PolymorphicButtonProps<C>) => {
  const Component = as || 'button';
  
  return (
    <Component
      className={cn(
        'px-4 py-2 rounded-lg',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-900'
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

// Utilisation
<Button onClick={handleClick}>Click me</Button>
<Button as="a" href="/page">Link Button</Button>
<Button as={Link} to="/page">Router Link</Button>
```

---

## ⚡ PERFORMANCE PATTERNS

### 1. React.memo Strategy

#### ❌ AVANT (re-render inutiles)

```tsx
const UserCard = ({ user, onEdit, onDelete }: UserCardProps) => {
  console.log('UserCard render'); // Re-render à chaque fois !
  
  return (
    <div>
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user)}>Edit</button>
      <button onClick={() => onDelete(user)}>Delete</button>
    </div>
  );
};
```

#### ✅ APRÈS (memoization)

```tsx
export const UserCard = memo(
  ({ user, onEdit, onDelete }: UserCardProps) => {
    console.log('UserCard render'); // Re-render uniquement si props changent
    
    return (
      <div>
        <h3>{user.name}</h3>
        <button onClick={() => onEdit(user)}>Edit</button>
        <button onClick={() => onDelete(user)}>Delete</button>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison (optionnel)
    return (
      prevProps.user.id === nextProps.user.id &&
      prevProps.user.updated_at === nextProps.user.updated_at
    );
  }
);
```

### 2. useCallback for Stable References

```tsx
const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);

  // ❌ Nouvelle référence à chaque render
  const handleEdit = (user: User) => {
    // ...
  };

  // ✅ Référence stable
  const handleEdit = useCallback((user: User) => {
    setUsers(prev => prev.map(u => 
      u.id === user.id ? { ...u, ...user } : u
    ));
  }, []); // Pas de dépendances car on use setUsers avec fonction

  const handleDelete = useCallback((userId: number) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  return (
    <div>
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};
```

### 3. useMemo for Expensive Calculations

```tsx
const StatisticsPage = () => {
  const { data: users } = useUsers();

  // ❌ Recalculé à chaque render
  const stats = calculateComplexStats(users);

  // ✅ Recalculé uniquement si users change
  const stats = useMemo(() => 
    calculateComplexStats(users),
    [users]
  );

  // Autre exemple
  const sortedAndFilteredUsers = useMemo(() => {
    return users
      .filter(u => u.status === 'active')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  return <StatsDisplay stats={stats} />;
};
```

### 4. Virtual Scrolling for Long Lists

```tsx
// hooks/useVirtualScroll.ts
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
  };
};

// Utilisation
const VirtualUserList = ({ users }: { users: User[] }) => {
  const ITEM_HEIGHT = 80;
  const CONTAINER_HEIGHT = 600;

  const { visibleItems, offsetY, totalHeight, onScroll } = useVirtualScroll(
    users,
    ITEM_HEIGHT,
    CONTAINER_HEIGHT
  );

  return (
    <div
      style={{ height: CONTAINER_HEIGHT, overflow: 'auto' }}
      onScroll={onScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 5. Code Splitting & Lazy Loading

```tsx
// App.tsx
import { lazy, Suspense } from 'react';

// ❌ Tout chargé au démarrage
import { UsersPage } from './features/users/pages/UsersPage';
import { CoursesPage } from './features/courses/pages/CoursesPage';
import { StorePage } from './features/store/pages/StorePage';

// ✅ Chargé à la demande
const UsersPage = lazy(() => import('./features/users/pages/UsersPage'));
const CoursesPage = lazy(() => import('./features/courses/pages/CoursesPage'));
const StorePage = lazy(() => import('./features/store/pages/StorePage'));

const App = () => (
  <Routes>
    <Route
      path="/users"
      element={
        <Suspense fallback={<PageLoadingSpinner />}>
          <UsersPage />
        </Suspense>
      }
    />
  </Routes>
);

// Préchargement au hover
const Navigation = () => {
  const prefetchUsers = () => {
    import('./features/users/pages/UsersPage');
  };

  return (
    <Link to="/users" onMouseEnter={prefetchUsers}>
      Users
    </Link>
  );
};
```

---

## 📁 CODE ORGANIZATION

### 1. Barrel Exports Pattern

```tsx
// features/users/components/index.ts
export { UserCard } from './UserCard';
export { UserList } from './UserList';
export { UserForm } from './UserForm';
export type { UserCardProps } from './UserCard';

// Utilisation
import { UserCard, UserList, UserForm } from '@/features/users/components';
```

### 2. Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/types": ["./src/types"],
      "@/utils": ["./src/utils"],
      "@/hooks": ["./src/hooks"],
      "@/api": ["./src/api"]
    }
  }
}
```

```tsx
// Utilisation
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/shared/hooks/useAuth';
import { User } from '@/types';
import { formatDate } from '@/utils/date';
```

### 3. Constants Organization

```tsx
// constants/user.ts
export const USER_ROLES = {
  ADMIN: 'admin',
  PROFESSOR: 'professor',
  MEMBER: 'member',
  PARENT: 'parent',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const USER_STATUS = {
  ACTIVE: 1,
  INACTIVE: 2,
  SUSPENDED: 3,
} as const;

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: 'Administrateur',
  [USER_ROLES.PROFESSOR]: 'Professeur',
  [USER_ROLES.MEMBER]: 'Membre',
  [USER_ROLES.PARENT]: 'Parent',
};

// constants/index.ts
export * from './user';
export * from './course';
export * from './payment';
```

### 4. Utils Organization

```tsx
// utils/index.ts
export * from './date';
export * from './string';
export * from './array';
export * from './validation';

// utils/date.ts
export const formatDate = (date: Date | string): string => {
  // ...
};

export const isDateInPast = (date: Date): boolean => {
  // ...
};

// utils/array.ts
export const groupBy = <T, K extends keyof any>(
  array: T[],
  getKey: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((acc, item) => {
    const key = getKey(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
};

export const unique = <T>(array: T[]): T[] => [...new Set(array)];
```

---

## 🔒 TYPE SAFETY

### 1. Eliminate `any` Types

#### ❌ AVANT

```tsx
const handleSubmit = (data: any) => {
  apiClient.post('/users', data);
};

const parseResponse = (response: any) => {
  return response.data;
};
```

#### ✅ APRÈS

```tsx
type UserFormData = {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
};

type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

const handleSubmit = (data: UserFormData) => {
  apiClient.post<User>('/users', data);
};

const parseResponse = <T>(response: ApiResponse<T>): T => {
  return response.data;
};
```

### 2. Discriminated Unions

```tsx
// ❌ AVANT (type unsafe)
type ModalState = {
  type: string;
  item?: any;
  user?: any;
};

// ✅ APRÈS (type safe)
type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; item: User }
  | { type: 'delete'; userId: number }
  | { type: 'viewDetails'; user: User };

const handleModal = (state: ModalState) => {
  switch (state.type) {
    case 'none':
      return null;
    case 'create':
      return <CreateModal />;
    case 'edit':
      // TypeScript sait que state.item existe et est un User
      return <EditModal user={state.item} />;
    case 'delete':
      // TypeScript sait que state.userId existe
      return <DeleteConfirm userId={state.userId} />;
    case 'viewDetails':
      return <UserDetails user={state.user} />;
  }
};
```

### 3. Utility Types

```tsx
// types/utils.ts
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type AsyncData<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

// Utilisation
type UserFormData = PartialBy<User, 'id' | 'created_at'>;
type CreateUserDto = Omit<User, 'id' | 'created_at' | 'updated_at'>;

const userState: AsyncData<User[]> = {
  data: null,
  isLoading: true,
  error: null,
};
```

### 4. Type Guards

```tsx
// utils/typeGuards.ts
export const isUser = (value: unknown): value is User => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'role' in value
  );
};

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    'message' in error
  );
};

// Utilisation
const handleError = (error: unknown) => {
  if (isApiError(error)) {
    // TypeScript sait que error.response existe
    toast.error(error.response.data.message);
  } else {
    toast.error('An unexpected error occurred');
  }
};
```

---

## 🚨 ERROR HANDLING

### 1. Error Boundaries

```tsx
// components/ErrorBoundary.tsx
type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Log to error reporting service
    // logErrorToService(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.reset);
      }

      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <button onClick={this.reset}>Try again</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Utilisation
<ErrorBoundary
  fallback={(error, reset) => (
    <AlertBanner
      variant="danger"
      title="Error"
      message={error.message}
      action={<Button onClick={reset}>Retry</Button>}
    />
  )}
>
  <UsersPage />
</ErrorBoundary>
```

### 2. Async Error Handling

```tsx
// utils/asyncHandler.ts
export const asyncHandler = <T>(
  promise: Promise<T>
): Promise<[T, null] | [null, Error]> => {
  return promise
    .then((data) => [data, null] as [T, null])
    .catch((error) => [null, error] as [null, Error]);
};

// Utilisation
const fetchUser = async (id: number) => {
  const [user, error] = await asyncHandler(userApi.getUser(id));

  if (error) {
    toast.error('Failed to fetch user');
    return null;
  }

  return user;
};
```

### 3. Result Pattern

```tsx
// utils/result.ts
type Success<T> = { success: true; data: T };
type Failure<E> = { success: false; error: E };
type Result<T, E = Error> = Success<T> | Failure<E>;

export const success = <T>(data: T): Success<T> => ({
  success: true,
  data,
});

export const failure = <E>(error: E): Failure<E> => ({
  success: false,
  error,
});

// Utilisation
const updateUser = async (
  id: number,
  data: UserFormData
): Promise<Result<User, ApiError>> => {
  try {
    const user = await userApi.updateUser(id, data);
    return success(user);
  } catch (error) {
    return failure(error as ApiError);
  }
};

const handleUpdate = async () => {
  const result = await updateUser(userId, formData);

  if (result.success) {
    toast.success('User updated');
    navigate(`/users/${result.data.id}`);
  } else {
    toast.error(result.error.message);
  }
};
```

---

## 🧪 TESTING STRATEGY

### 1. Unit Tests for Utils

```tsx
// utils/date.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, isDateInPast } from './date';

describe('date utils', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('15/01/2024');
    });

    it('handles string input', () => {
      expect(formatDate('2024-01-15')).toBe('15/01/2024');
    });
  });

  describe('isDateInPast', () => {
    it('returns true for past dates', () => {
      const pastDate = new Date('2020-01-01');
      expect(isDateInPast(pastDate)).toBe(true);
    });

    it('returns false for future dates', () => {
      const futureDate = new Date('2030-01-01');
      expect(isDateInPast(futureDate)).toBe(false);
    });
  });
});
```

### 2. Component Tests

```tsx
// components/UserCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserCard } from './UserCard';

const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'member',
};

describe('UserCard', () => {
  it('renders user information', () => {
    render(<UserCard user={mockUser} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<UserCard user={mockUser} onEdit={onEdit} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(mockUser);
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<UserCard user={mockUser} onEdit={vi.fn()} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith(mockUser.id);
  });
});
```

### 3. Integration Tests

```tsx
// pages/UsersPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsersPage } from './UsersPage';
import * as userApi from '../api/userApi';

vi.mock('../api/userApi');

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays loading state initially', () => {
    vi.mocked(userApi.getUsers).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <UsersPage />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays users after loading', async () => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ];

    vi.mocked(userApi.getUsers).mockResolvedValue({
      items: mockUsers,
      total: 2,
    });

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <UsersPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('displays error message on API failure', async () => {
    vi.mocked(userApi.getUsers).mockRejectedValue(
      new Error('Failed to fetch users')
    );

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <UsersPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch users/i)).toBeInTheDocument();
    });
  });
});
```

---

## ♿ ACCESSIBILITY

### 1. Semantic HTML

#### ❌ AVANT

```tsx
<div onClick={handleClick}>Click me</div>
<div className="modal">
  <div className="modal-header">Title</div>
  <div className="modal-body">Content</div>
</div>
```

#### ✅ APRÈS

```tsx
<button onClick={handleClick}>Click me</button>

<dialog role="dialog" aria-labelledby="modal-title">
  <header>
    <h2 id="modal-title">Title</h2>
  </header>
  <main>Content</main>
</dialog>
```

### 2. ARIA Attributes

```tsx
// components/SearchBar.tsx
export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div role="combobox" aria-expanded={isOpen} aria-haspopup="listbox">
      <label htmlFor="search-input" className="sr-only">
        Search users
      </label>
      <input
        id="search-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-autocomplete="list"
        aria-controls="search-results"
        aria-activedescendant={activeId}
      />
      {isOpen && (
        <ul id="search-results" role="listbox">
          {results.map((result) => (
            <li key={result.id} role="option" aria-selected={false}>
              {result.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

### 3. Keyboard Navigation

```tsx
// hooks/useKeyboardNavigation.ts
export const useKeyboardNavigation = (
  items: any[],
  onSelect: (item: any) => void
) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (items[activeIndex]) {
          onSelect(items[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setActiveIndex(0);
        break;
    }
  };

  return { activeIndex, handleKeyDown };
};
```

### 4. Focus Management

```tsx
// hooks/useFocusTrap.ts
export const useFocusTrap = (ref: RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    ref.current.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      ref.current?.removeEventListener('keydown', handleTabKey);
    };
  }, [ref]);
};

// Utilisation
const Modal = ({ isOpen, onClose }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef);

  if (!isOpen) return null;

  return (
    <div ref={modalRef} role="dialog">
      {/* Modal content */}
    </div>
  );
};
```

---

## 📅 PLAN D'ACTION

### Phase 1 : Quick Wins (1-2 semaines)

**Objectif :** Améliorer immédiatement la qualité du code

#### Semaine 1
- [ ] **Jour 1-2 :** Ajouter types stricts (éliminer `any`)
- [ ] **Jour 3 :** Créer hooks génériques (useApi, usePaginatedApi)
- [ ] **Jour 4 :** Ajouter error boundaries
- [ ] **Jour 5 :** Optimiser stores Zustand (slices, selectors)

#### Semaine 2
- [ ] **Jour 1-2 :** Ajouter React.memo aux composants lourds
- [ ] **Jour 3 :** Implémenter useCallback/useMemo
- [ ] **Jour 4 :** Lazy loading des routes
- [ ] **Jour 5 :** Tests pour utils critiques

**Métriques :**
- 0 `any` types
- 90%+ TypeScript strictness
- -30% bundle size
- Tests coverage > 40%

---

### Phase 2 : Architecture (2-3 semaines)

**Objectif :** Solidifier l'architecture

#### Semaine 3
- [ ] Refactor stores (modulariser)
- [ ] Créer composants polymorphiques
- [ ] Standardiser error handling
- [ ] Ajouter path aliases

#### Semaine 4
- [ ] Implémenter virtual scrolling
- [ ] Créer hooks de performance
- [ ] Barrel exports partout
- [ ] Documentation composants

#### Semaine 5
- [ ] Tests composants critiques
- [ ] Tests d'intégration pages
- [ ] Code review & cleanup
- [ ] Performance audit

**Métriques :**
- Tests coverage > 60%
- 0 prop drilling > 2 niveaux
- Performance score > 85

---

### Phase 3 : Polish (1-2 semaines)

**Objectif :** Excellence et accessibilité

#### Semaine 6
- [ ] ARIA attributes complets
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Screen reader tests

#### Semaine 7
- [ ] Storybook pour composants
- [ ] Visual regression tests
- [ ] Performance monitoring
- [ ] Documentation finale

**Métriques :**
- WCAG AA compliance
- Tests coverage > 80%
- Lighthouse > 95
- 0 console errors

---

## 📊 MÉTRIQUES DE SUCCÈS

### Avant Refactorisation

| Métrique | Valeur |
|----------|--------|
| TypeScript strict | 85% |
| Tests coverage | 40% |
| Bundle size | ~800 KB |
| Lighthouse Performance | 75 |
| Accessibility score | 60 |
| Any types | ~50 |
| Code duplication | 15% |

### Après Refactorisation (Objectif)

| Métrique | Valeur | Gain |
|----------|--------|------|
| TypeScript strict | 98% | +13% |
| Tests coverage | 80% | +40% |
| Bundle size | ~280 KB | -65% |
| Lighthouse Performance | 95+ | +27% |
| Accessibility score | 95+ | +58% |
| Any types | 0 | -100% |
| Code duplication | <5% | -67% |

---

## 🎯 CHECKLIST DE VALIDATION

### Code Quality
- [ ] 0 `any` types
- [ ] 0 `@ts-ignore` comments
- [ ] 0 console.log en production
- [ ] 0 eslint errors
- [ ] < 5 eslint warnings

### Performance
- [ ] Lazy loading routes
- [ ] Code splitting optimal
- [ ] React.memo sur composants lourds
- [ ] useCallback/useMemo appropriés
- [ ] Virtual scrolling si > 100 items

### Architecture
- [ ] Feature-first organization
- [ ] Barrel exports
- [ ] Path aliases
- [ ] Separation of concerns
- [ ] DRY principle

### Testing
- [ ] Unit tests utils (> 90%)
- [ ] Component tests (> 80%)
- [ ] Integration tests (> 60%)
- [ ] E2E tests critical paths
- [ ] Visual regression tests

### Accessibility
- [ ] Semantic HTML
- [ ] ARIA attributes
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Screen reader compatible

### Documentation
- [ ] JSDoc sur fonctions publiques
- [ ] README par feature
- [ ] Storybook composants
- [ ] Architecture decision records
- [ ] Migration guides

---

## 🚀 NEXT STEPS

### Immédiatement
1. Lire ce guide en entier
2. Choisir une phase (recommandé : Phase 1)
3. Créer une branche `refactor/phase-1`
4. Commencer par les quick wins

### Cette semaine
1. Éliminer les `any` types
2. Créer hooks génériques
3. Ajouter error boundaries
4. Optimiser stores Zustand

### Ce mois
1. Compléter Phase 1
2. Démarrer Phase 2
3. Mesurer les gains
4. Ajuster le plan

---

## 📚 RESSOURCES

### Documentation
- [React Patterns](https://reactpatterns.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)

### Outils
- [Vite Bundle Analyzer](https://www.npmjs.com/package/vite-bundle-visualizer)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Axe DevTools](https://www.deque.com/axe/devtools/)

---

**Version :** 1.0  
**Dernière mise à jour :** 2024  
**Responsable :** Équipe Frontend  
**Statut :** 🟢 Prêt à l'emploi

---

**BON REFACTORING ! 🚀**