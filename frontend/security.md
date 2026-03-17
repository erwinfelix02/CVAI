## Security Implementation Explanation

The CampusAI system uses several security measures to protect user accounts, restrict access, and validate data before it is stored or processed.

### 1. Authentication Using JWT

The system uses **JSON Web Tokens (JWT)** for authentication.  
When a user logs in, a token is issued and sent to the client.  
For protected routes, the client must include this token in the `Authorization` header using the format:

`Bearer <token>`

The authentication middleware checks whether:
- a token is present
- the token is valid
- the token has not expired

If the token is valid, the decoded user information is attached to the request and the user is allowed to continue.  
If the token is missing or invalid, access is denied.

### 2. Role-Based Access Control

The system uses **role-based authorization** to control which users can access specific parts of the system.

Each authenticated user has a role such as:
- Super Admin
- Registrar
- Dept Head
- Finance
- Faculty
- Student

After authentication, the system checks whether the user's role is allowed to access a route.  
If the role is not included in the allowed list, the request is rejected.

This prevents unauthorized users from accessing restricted modules.

### 3. Permission-Based Access Control

In addition to roles, the system also supports **permission-based authorization**.

Each role is mapped to a stored role document that contains a list of permissions.  
When a user tries to perform a specific action, the system checks whether their role includes the required permission key.

This provides more granular control than role-based access alone.  
For example, two users may have access to the same module, but only one may have permission to edit or approve records.

### 4. Input Validation and Sanitization

Before user data is stored, the system validates and sanitizes inputs to reduce the risk of invalid data and attacks.

Security checks include:
- required field validation
- email format validation
- phone number format validation
- role validation against allowed values
- sanitization of text fields using input escaping
- normalization of email addresses

This helps protect the system from:
- malformed input
- unexpected values
- injection attempts
- unsafe text content

### 5. Duplicate Record Protection

The system checks whether important fields already exist before creating new accounts.

Examples include:
- email uniqueness
- ID number uniqueness
- one Registrar account only
- one Department Head per department

This prevents duplicate or conflicting user records.

### 6. Controlled Account Activation

Newly created accounts are initially stored as **inactive**.  
Credentials are only sent when the administrator explicitly activates the account.

This improves security because accounts are not immediately usable after creation.  
It also ensures that access is granted only after administrative approval.

### 7. Temporary Credentials

When credentials are sent, the system generates a temporary password for the user.  
The user is then instructed to log in and change the password immediately.

This reduces the risk of long-term use of system-generated passwords.

### 8. Password Protection

The system uses `bcryptjs` for password security.  
Passwords should never be stored in plain text.  
Instead, they should be hashed before being saved to the database.

If the user model is configured with password hashing middleware, even temporary passwords are converted into secure hashes before storage.

This ensures that actual passwords are not directly readable from the database.

### 9. Header and Database Protection

Additional libraries are used to strengthen backend security:

- `helmet` helps secure HTTP headers
- `express-mongo-sanitize` helps prevent MongoDB operator injection attacks

These protections reduce common backend vulnerabilities.

### 10. Access Denial for Unauthorized Requests

The system returns proper error responses when access is not allowed:

- `401 Unauthorized` for missing, invalid, or expired tokens
- `403 Forbidden` for insufficient roles or permissions

This ensures that only verified and authorized users can access protected resources.

### 11. Important Note About JWT

JWT tokens are primarily used for **authentication and integrity**, not for encrypting data.  
They prove that the user is authenticated and that the token contents have not been tampered with.

Sensitive data should still be protected through:
- hashed passwords
- secure environment variables
- HTTPS in deployment
- proper database security

### Summary

The security design of the system includes:
- JWT-based authentication
- role-based access control
- permission-based access control
- input validation and sanitization
- duplicate record prevention
- controlled account activation
- temporary credential handling
- password hashing
- backend hardening with security middleware

These measures help ensure that the CampusAI system remains secure, reliable, and protected against unauthorized access and common web vulnerabilities.