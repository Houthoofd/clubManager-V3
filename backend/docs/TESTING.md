# 🧪 Testing Documentation

Documentation complète sur les tests du backend ClubManager v3.

---

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Structure des tests](#structure-des-tests)
- [Types de tests](#types-de-tests)
- [Exécution des tests](#exécution-des-tests)
- [Couverture de code](#couverture-de-code)
- [Bonnes pratiques](#bonnes-pratiques)
- [Exemples](#exemples)
- [Dépannage](#dépannage)

---

## 🎯 Vue d'ensemble

Le projet utilise **Jest** comme framework de test avec **TypeScript** pour garantir la qualité et la fiabilité du code.

### Technologies utilisées

- **Jest** - Framework de test
- **ts-jest** - Preset TypeScript pour Jest
- **Supertest** - Tests HTTP/API
- **@types/jest** - Types TypeScript pour Jest

### Philosophie de test

- ✅ **Tests unitaires** pour les services et use cases
- ✅ **Tests d'intégration** pour les repositories et controllers
- ✅ **Tests E2E** pour les flux complets
- ✅ **Mocking** des dépendances externes
- ✅ **AAA Pattern** (Arrange, Act, Assert)

---

## 📁 Structure des tests

```
backend/
├── src/
│   ├── modules/
│   │   └── auth/
│   │       ├── application/
│   │       │   └── use-cases/
│   │       │       ├── __tests__/
│   │       │       │   ├── RegisterUseCase.test.ts
│   │       │       │   ├── LoginUseCase.test.ts
│   │       │       │   ├── RefreshTokenUseCase.test.ts
│   │       │       │   └── LogoutUseCase.test.ts
│   │       ├── infrastructure/
│   │       │   └── repositories/
│   │       │       └── __tests__/
│   │       │           └── MySQLAuthRepository.test.ts
│   │       └── presentation/
│   │           └── controllers/
│   │               └── __tests__/
│   │                   └── AuthController.test.ts
│   ├── shared/
│   │   ├── services/
│   │   │   └── __tests__/
│   │   │       ├── PasswordService.test.ts
│   │   │       ├── JwtService.test.ts
│   │   │       └── TokenService.test.ts
│   │   └── middleware/
│   │       └── __tests__/
│   │           └── authMiddleware.test.ts
│   └── core/
│       └── database/
│           └── __tests__/
│               └── connection.test.ts
└── tests/
    ├── integration/
    │   └── auth.integration.test.ts
    └── e2e/
        └── auth.e2e.test.ts
```

---

## 🔍 Types de tests

### 1. Tests Unitaires

Tests des fonctions et méthodes individuelles en isolation.

**Localisation:** `__tests__/` à côté du code source

**Exemple:**
```typescript
describe('PasswordService', () => {
  describe('hash', () => {
    it('should hash a valid password', async () => {
      const password = 'SecurePass123!@#';
      const hash = await PasswordService.hash(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
    });
  });
});
```

**Couverture:**
- ✅ PasswordService (hash, compare, validate, generate)
- ✅ JwtService (generate, verify, decode)
- ✅ TokenService (generate, validate, hash)
- ✅ RegisterUseCase (validation, business logic)
- ✅ LoginUseCase (authentication flow)
- ✅ RefreshTokenUseCase (token rotation)
- ✅ LogoutUseCase (token revocation)

### 2. Tests d'Intégration

Tests des interactions entre plusieurs composants.

**Localisation:** `tests/integration/`

**Exemple:**
```typescript
describe('Auth Integration Tests', () => {
  it('should register, login, and access protected route', async () => {
    // Register
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    // Login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    
    // Access protected route
    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    
    expect(meResponse.status).toBe(200);
  });
});
```

### 3. Tests E2E (End-to-End)

Tests des scénarios utilisateur complets.

**Localisation:** `tests/e2e/`

**Exemple:**
```typescript
describe('Auth E2E', () => {
  it('should complete full authentication flow', async () => {
    // 1. Register
    // 2. Verify email
    // 3. Login
    // 4. Access protected resources
    // 5. Refresh token
    // 6. Logout
  });
});
```

---

## 🚀 Exécution des tests

### Commandes principales

```bash
# Exécuter tous les tests
npm test

# Mode watch (développement)
npm run test:watch

# Couverture de code
npm run test:coverage

# Tests unitaires uniquement
npm run test:unit

# Tests E2E uniquement
npm run test:e2e
```

### Commandes spécifiques

```bash
# Exécuter un fichier de test spécifique
npm test -- PasswordService.test.ts

# Exécuter tests d'un module
npm test -- auth

# Exécuter avec verbose output
npm test -- --verbose

# Exécuter en mode debug
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Variables d'environnement

Créer `.env.test` pour les tests :

```bash
NODE_ENV=test
DB_HOST=localhost
DB_PORT=3306
DB_USER=test_user
DB_PASSWORD=test_password
DB_NAME=clubmanager_test
JWT_ACCESS_SECRET=test-access-secret
JWT_REFRESH_SECRET=test-refresh-secret
```

---

## 📊 Couverture de code

### Objectifs de couverture

- **Statements:** ≥ 80%
- **Branches:** ≥ 75%
- **Functions:** ≥ 80%
- **Lines:** ≥ 80%

### Générer le rapport

```bash
# Générer et afficher la couverture
npm run test:coverage

# Ouvrir le rapport HTML
open coverage/lcov-report/index.html
```

### Configuration Jest

```javascript
// jest.config.cjs
module.exports = {
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    }
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**',
    '!src/server.ts'
  ]
};
```

---

## ✅ Bonnes pratiques

### 1. Naming Convention

```typescript
// ✅ BON
describe('PasswordService', () => {
  describe('hash', () => {
    it('should hash a valid password', () => {});
    it('should throw error if password is empty', () => {});
  });
});

// ❌ MAUVAIS
describe('test', () => {
  it('works', () => {});
});
```

### 2. AAA Pattern (Arrange, Act, Assert)

```typescript
it('should validate a strong password', () => {
  // Arrange
  const password = 'SecurePass123!@#';
  
  // Act
  const result = PasswordService.validatePasswordStrength(password);
  
  // Assert
  expect(result.isValid).toBe(true);
  expect(result.errors).toHaveLength(0);
});
```

### 3. Mocking

```typescript
// Mock du repository
const mockRepository: jest.Mocked<IAuthRepository> = {
  createUser: jest.fn(),
  findUserByEmail: jest.fn(),
  // ... autres méthodes
};

// Configuration du mock
mockRepository.findUserByEmail.mockResolvedValue(mockUser);
```

### 4. Cleanup

```typescript
describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockRepository: jest.Mocked<IAuthRepository>;

  beforeEach(() => {
    // Setup avant chaque test
    mockRepository = createMockRepository();
    useCase = new LoginUseCase(mockRepository);
  });

  afterEach(() => {
    // Cleanup après chaque test
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Cleanup final
    jest.restoreAllMocks();
  });
});
```

### 5. Tests asynchrones

```typescript
// ✅ BON - Async/Await
it('should hash password', async () => {
  const hash = await PasswordService.hash('test');
  expect(hash).toBeDefined();
});

// ✅ BON - Promise
it('should hash password', () => {
  return PasswordService.hash('test').then(hash => {
    expect(hash).toBeDefined();
  });
});

// ❌ MAUVAIS - Pas de gestion async
it('should hash password', () => {
  const hash = PasswordService.hash('test');
  expect(hash).toBeDefined(); // ❌ Teste la Promise, pas le résultat
});
```

### 6. Tests de validation

```typescript
// Tester tous les cas de validation
describe('validateInput', () => {
  it('should reject empty email', () => {
    expect(() => validate({ email: '' })).toThrow('Email is required');
  });

  it('should reject invalid email format', () => {
    expect(() => validate({ email: 'invalid' })).toThrow('Invalid email');
  });

  it('should accept valid email', () => {
    expect(() => validate({ email: 'test@example.com' })).not.toThrow();
  });
});
```

### 7. Tests de sécurité

```typescript
describe('Security', () => {
  it('should not leak user information on invalid login', async () => {
    const result = await loginUseCase.execute({
      email: 'nonexistent@example.com',
      password: 'password'
    });
    
    // Message générique, pas "user not found"
    expect(result.message).toBe('Invalid email or password');
  });

  it('should use constant-time comparison', () => {
    // Vérifier que le temps d'exécution est similaire
    // pour éviter les timing attacks
  });
});
```

---

## 📖 Exemples

### Test Service Complet

```typescript
import { PasswordService } from '../PasswordService';

describe('PasswordService', () => {
  describe('hash', () => {
    it('should hash a valid password', async () => {
      const password = 'SecurePass123!@#';
      const hash = await PasswordService.hash(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'SecurePass123!@#';
      const hash1 = await PasswordService.hash(password);
      const hash2 = await PasswordService.hash(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should throw error if password is too short', async () => {
      await expect(PasswordService.hash('short'))
        .rejects
        .toThrow('Password must be at least 8 characters long');
    });
  });

  describe('compare', () => {
    it('should return true for matching password', async () => {
      const password = 'SecurePass123!@#';
      const hash = await PasswordService.hash(password);
      const isMatch = await PasswordService.compare(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'SecurePass123!@#';
      const wrongPassword = 'WrongPass123!@#';
      const hash = await PasswordService.hash(password);
      const isMatch = await PasswordService.compare(wrongPassword, hash);

      expect(isMatch).toBe(false);
    });
  });
});
```

### Test Use Case avec Mocks

```typescript
import { RegisterUseCase } from '../RegisterUseCase';
import type { IAuthRepository } from '../../domain/repositories/IAuthRepository';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let mockRepository: jest.Mocked<IAuthRepository>;

  beforeEach(() => {
    mockRepository = {
      createUser: jest.fn(),
      findUserByEmail: jest.fn(),
      emailExists: jest.fn(),
      storeEmailVerificationToken: jest.fn(),
      storeRefreshToken: jest.fn(),
    } as any;

    useCase = new RegisterUseCase(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register user successfully', async () => {
    // Arrange
    const dto = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
      date_of_birth: '1990-01-01',
      genre_id: 1
    };

    mockRepository.emailExists.mockResolvedValue(false);
    mockRepository.createUser.mockResolvedValue({
      id: 1,
      userId: 'U-2024-0001',
      email: dto.email,
      // ... autres champs
    } as any);

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data.user.email).toBe(dto.email);
    expect(result.data.tokens.accessToken).toBeDefined();
    expect(mockRepository.emailExists).toHaveBeenCalledWith(dto.email);
    expect(mockRepository.createUser).toHaveBeenCalled();
  });

  it('should throw error if email already exists', async () => {
    // Arrange
    const dto = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'existing@example.com',
      password: 'SecurePass123!',
      date_of_birth: '1990-01-01',
      genre_id: 1
    };

    mockRepository.emailExists.mockResolvedValue(true);

    // Act & Assert
    await expect(useCase.execute(dto)).rejects.toThrow('Email already registered');
    expect(mockRepository.createUser).not.toHaveBeenCalled();
  });
});
```

### Test d'Intégration HTTP

```typescript
import request from 'supertest';
import createApp from '../../../app';

describe('Auth Integration Tests', () => {
  const app = createApp();
  let accessToken: string;

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          password: 'SecurePass123!',
          date_of_birth: '1990-01-01',
          genre_id: 1
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('john@example.com');
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should return 400 for duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'john@example.com', // Email déjà utilisé
          password: 'SecurePass123!',
          date_of_birth: '1990-01-01',
          genre_id: 1
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.accessToken).toBeDefined();
      
      accessToken = response.body.data.accessToken;
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe('john@example.com');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });
});
```

---

## 🔧 Dépannage

### Problèmes courants

#### 1. Tests qui échouent de manière intermittente

```typescript
// ❌ PROBLÈME: Race condition
it('test with timeout', async () => {
  setTimeout(() => doSomething(), 100);
  expect(result).toBe(expected); // ❌ Peut échouer
});

// ✅ SOLUTION: Utiliser async/await
it('test with timeout', async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const result = await doSomething();
  expect(result).toBe(expected);
});
```

#### 2. Mocks qui ne fonctionnent pas

```typescript
// ❌ PROBLÈME: Mock après import
import { PasswordService } from './PasswordService';
jest.mock('./PasswordService');

// ✅ SOLUTION: Mock avant import
jest.mock('./PasswordService');
import { PasswordService } from './PasswordService';
```

#### 3. Tests de base de données

```typescript
// Utiliser une base de données de test séparée
beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await cleanupTestDatabase();
});

beforeEach(async () => {
  await clearDatabase();
});
```

#### 4. Timeouts

```typescript
// Augmenter le timeout pour tests longs
it('long running test', async () => {
  // test code
}, 10000); // 10 secondes

// Ou globalement
jest.setTimeout(10000);
```

---

## 📚 Ressources

### Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

### Commandes utiles

```bash
# Mettre à jour les snapshots
npm test -- -u

# Exécuter tests en parallèle
npm test -- --maxWorkers=4

# Désactiver cache
npm test -- --no-cache

# Lister tous les tests
npm test -- --listTests

# Exécuter tests modifiés uniquement
npm test -- --onlyChanged
```

---

## 🎯 Checklist

Avant de soumettre du code :

- [ ] Tous les tests passent (`npm test`)
- [ ] Couverture ≥ 80% (`npm run test:coverage`)
- [ ] Pas de `console.log` ou `debugger`
- [ ] Tests suivent le pattern AAA
- [ ] Mocks sont nettoyés après chaque test
- [ ] Tests sont indépendants les uns des autres
- [ ] Noms de tests sont descriptifs
- [ ] Edge cases sont couverts
- [ ] Tests de sécurité sont inclus
- [ ] Documentation est à jour

---

**Version:** 1.0.0  
**Dernière mise à jour:** 2024
**Auteur:** ClubManager Team