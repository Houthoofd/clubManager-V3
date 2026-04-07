# 🔐 Authentication API Testing Guide

Guide complet pour tester l'API d'authentification avec Postman ou Thunder Client.

---

## 📋 Table des matières

- [Configuration](#configuration)
- [Variables d'environnement](#variables-denvironnement)
- [Endpoints](#endpoints)
  - [1. Register](#1-register)
  - [2. Login](#2-login)
  - [3. Refresh Token](#3-refresh-token)
  - [4. Logout](#4-logout)
  - [5. Logout All](#5-logout-all)
  - [6. Get Current User](#6-get-current-user)
  - [7. Health Check](#7-health-check)
- [Scénarios de test](#scénarios-de-test)
- [Erreurs communes](#erreurs-communes)

---

## ⚙️ Configuration

### Base URL
```
http://localhost:3000/api
```

### Headers requis
```
Content-Type: application/json
```

### Pour les routes protégées
```
Authorization: Bearer {{accessToken}}
```

---

## 🔧 Variables d'environnement

Créer ces variables dans Postman/Thunder Client :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `baseUrl` | URL de base de l'API | `http://localhost:3000/api` |
| `accessToken` | Token d'accès JWT | (sera rempli automatiquement) |
| `refreshToken` | Token de rafraîchissement | (sera rempli automatiquement) |
| `userId` | ID de l'utilisateur | (sera rempli automatiquement) |

---

## 📡 Endpoints

### 1. Register

**Créer un nouveau compte utilisateur**

```http
POST {{baseUrl}}/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!@#",
  "date_of_birth": "1990-05-15",
  "genre_id": 1,
  "nom_utilisateur": "johndoe",
  "abonnement_id": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "user": {
      "id": 1,
      "userId": "U-2024-0001",
      "first_name": "John",
      "last_name": "Doe",
      "nom_utilisateur": "johndoe",
      "email": "john.doe@example.com",
      "email_verified": false,
      "status_id": 1,
      "grade_id": null,
      "abonnement_id": 1
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

**Test Script (Postman):**
```javascript
// Sauvegarder le token d'accès
if (pm.response.code === 201) {
  const response = pm.response.json();
  pm.environment.set("accessToken", response.data.accessToken);
  pm.environment.set("userId", response.data.user.id);
}
```

---

### 2. Login

**Se connecter avec un compte existant**

```http
POST {{baseUrl}}/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!@#"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "userId": "U-2024-0001",
      "first_name": "John",
      "last_name": "Doe",
      "nom_utilisateur": "johndoe",
      "email": "john.doe@example.com",
      "email_verified": false,
      "status_id": 1,
      "grade_id": null,
      "abonnement_id": 1
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

**Test Script (Postman):**
```javascript
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set("accessToken", response.data.accessToken);
  pm.environment.set("userId", response.data.user.id);
  console.log("✅ Login successful!");
}
```

---

### 3. Refresh Token

**Renouveler le token d'accès expiré**

```http
POST {{baseUrl}}/auth/refresh
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

**Note:** Le refresh token est également stocké dans un cookie HTTP-only. Si vous testez depuis le navigateur, vous n'avez pas besoin de l'envoyer dans le body.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "user": {
      "id": 1,
      "userId": "U-2024-0001",
      "first_name": "John",
      "last_name": "Doe",
      "nom_utilisateur": "johndoe",
      "email": "john.doe@example.com",
      "email_verified": false,
      "status_id": 1,
      "grade_id": null,
      "abonnement_id": 1
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

**Test Script (Postman):**
```javascript
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set("accessToken", response.data.accessToken);
  console.log("✅ Token refreshed!");
}
```

---

### 4. Logout

**Se déconnecter (révoquer le refresh token)**

```http
POST {{baseUrl}}/auth/logout
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Test Script (Postman):**
```javascript
if (pm.response.code === 200) {
  pm.environment.unset("accessToken");
  pm.environment.unset("refreshToken");
  console.log("✅ Logout successful!");
}
```

---

### 5. Logout All

**Se déconnecter de tous les appareils**

```http
POST {{baseUrl}}/auth/logout-all
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": {{userId}}
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out from all devices"
}
```

---

### 6. Get Current User

**Récupérer les informations de l'utilisateur connecté**

```http
GET {{baseUrl}}/auth/me
Authorization: Bearer {{accessToken}}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "john.doe@example.com",
    "userIdString": "U-2024-0001"
  }
}
```

---

### 7. Health Check

**Vérifier l'état de l'API d'authentification**

```http
GET {{baseUrl}}/auth/health
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Auth API is healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🧪 Scénarios de test

### Scénario 1 : Inscription complète

1. **Register** - Créer un nouveau compte
2. **Vérifier** - Code 201, user créé, tokens reçus
3. **Get Me** - Tester l'accès avec le token reçu

### Scénario 2 : Connexion et navigation

1. **Login** - Se connecter avec un compte existant
2. **Get Me** - Vérifier les infos utilisateur
3. **Logout** - Se déconnecter

### Scénario 3 : Refresh token flow

1. **Login** - Se connecter
2. **Attendre 15+ minutes** - Laisser expirer l'access token
3. **Refresh** - Renouveler le token
4. **Get Me** - Vérifier avec le nouveau token

### Scénario 4 : Sécurité

1. **Get Me sans token** - Doit retourner 401
2. **Get Me avec token invalide** - Doit retourner 401
3. **Refresh avec token révoqué** - Doit retourner erreur

---

## ❌ Erreurs communes

### 1. Email déjà enregistré

**Request:** Register avec email existant

**Response (Error):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### 2. Mot de passe invalide (Login)

**Request:** Login avec mauvais mot de passe

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 3. Token manquant

**Request:** GET /auth/me sans Authorization header

**Response (401):**
```json
{
  "success": false,
  "message": "Authentication token is required",
  "error": "NO_TOKEN"
}
```

### 4. Token expiré

**Request:** Utiliser un access token expiré

**Response (401):**
```json
{
  "success": false,
  "message": "Access token has expired",
  "error": "TOKEN_EXPIRED"
}
```

### 5. Mot de passe trop faible

**Request:** Register avec mot de passe faible

**Response (Error):**
```json
{
  "success": false,
  "message": "Password validation failed: Password must contain at least one uppercase letter, Password must contain at least one number, Password must contain at least one special character"
}
```

### 6. Format email invalide

**Request:** Register/Login avec email mal formaté

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

---

## 📝 Notes importantes

### Sécurité des mots de passe

Les mots de passe doivent respecter les critères suivants :
- ✅ Minimum 8 caractères
- ✅ Au moins une majuscule
- ✅ Au moins une minuscule
- ✅ Au moins un chiffre
- ✅ Au moins un caractère spécial

**Exemples valides :**
- `SecurePass123!`
- `MyP@ssw0rd`
- `Test1234!@#$`

**Exemples invalides :**
- `password` (pas de majuscule, chiffre, spécial)
- `PASSWORD123` (pas de minuscule, spécial)
- `Pass1!` (trop court)

### Refresh Token

- Le refresh token est stocké dans un **cookie HTTP-only** pour plus de sécurité
- Durée de vie : **7 jours**
- Rotation automatique lors du refresh (l'ancien token est révoqué)

### Access Token

- Stocké côté client (localStorage ou mémoire)
- Durée de vie : **15 minutes**
- Doit être envoyé dans le header `Authorization: Bearer {token}`

### Cookies

Le backend définit automatiquement un cookie `refreshToken`. Pour tester avec Postman :
- Activer "Automatically follow redirects"
- Activer "Save cookies after redirect"
- Les cookies seront gérés automatiquement

---

## 🚀 Collection Postman

### Import rapide

Créer une nouvelle collection avec ces variables :

```json
{
  "info": {
    "name": "ClubManager Auth API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api",
      "type": "string"
    },
    {
      "key": "accessToken",
      "value": "",
      "type": "string"
    },
    {
      "key": "refreshToken",
      "value": "",
      "type": "string"
    },
    {
      "key": "userId",
      "value": "",
      "type": "string"
    }
  ]
}
```

---

## ✅ Checklist de test

- [ ] Register avec toutes les données requises
- [ ] Register avec email déjà existant (doit échouer)
- [ ] Register avec mot de passe faible (doit échouer)
- [ ] Login avec credentials valides
- [ ] Login avec mauvais mot de passe (doit échouer)
- [ ] Login avec email inexistant (doit échouer)
- [ ] Get Me avec token valide
- [ ] Get Me sans token (doit retourner 401)
- [ ] Get Me avec token invalide (doit retourner 401)
- [ ] Refresh token avec token valide
- [ ] Refresh token avec token invalide (doit échouer)
- [ ] Logout avec token valide
- [ ] Logout All avec authentification

---

**Bonne chance pour les tests ! 🎉**