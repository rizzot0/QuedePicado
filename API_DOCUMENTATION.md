# 📚 Documentación Técnica de la API

## 🔌 Endpoints Detallados

### **Autenticación**

#### `POST /api/auth/register`
Registra un nuevo usuario en el sistema.

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "contraseña123",
  "role": "TEACHER" // ADMIN, TEACHER, PARENT
}
```

**Response (200):**
```json
{
  "ok": true,
  "user": {
    "id": "user_id",
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "role": "TEACHER"
  }
}
```

#### `POST /api/auth/[...nextauth]`
Maneja el login/logout a través de NextAuth.js.

**Login Body:**
```json
{
  "email": "juan@ejemplo.com",
  "password": "contraseña123"
}
```

### **Administrador - Gestión de Usuarios**

#### `GET /api/admin/teachers`
Lista todos los profesores del sistema.

**Response (200):**
```json
{
  "ok": true,
  "teachers": [
    {
      "id": "teacher_id",
      "name": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "subjects": [
        {
          "id": "subject_id",
          "name": "Matemáticas"
        }
      ]
    }
  ]
}
```

#### `POST /api/admin/teachers`
Crea un nuevo profesor.

**Body:**
```json
{
  "name": "María García",
  "email": "maria@ejemplo.com",
  "password": "contraseña123"
}
```

#### `GET /api/admin/parents`
Lista todos los apoderados del sistema.

**Response (200):**
```json
{
  "ok": true,
  "parents": [
    {
      "id": "parent_id",
      "name": "Carlos López",
      "email": "carlos@ejemplo.com",
      "students": [
        {
          "id": "student_id",
          "name": "Ana López",
          "lastName": "García",
          "grade": "3°A"
        }
      ]
    }
  ]
}
```

#### `POST /api/admin/parents`
Crea un nuevo apoderado.

**Body:**
```json
{
  "name": "Carlos López",
  "email": "carlos@ejemplo.com",
  "password": "contraseña123"
}
```

### **Administrador - Gestión de Alumnos**

#### `GET /api/admin/students`
Lista todos los alumnos del sistema.

**Response (200):**
```json
{
  "ok": true,
  "students": [
    {
      "id": "student_id",
      "name": "Ana",
      "lastName": "López",
      "rut": "12345678-9",
      "grade": "3°A",
      "parentName": "Carlos López"
    }
  ]
}
```

#### `POST /api/admin/students`
Crea un nuevo alumno.

**Body:**
```json
{
  "name": "Ana",
  "lastName": "López",
  "rut": "12345678-9",
  "grade": "3°A",
  "parentId": "parent_id"
}
```

### **Administrador - Gestión de Asignaturas**

#### `GET /api/admin/subjects`
Lista todas las asignaturas del sistema.

**Response (200):**
```json
{
  "ok": true,
  "subjects": [
    {
      "id": "subject_id",
      "name": "Matemáticas",
      "teacherName": "Juan Pérez",
      "gradesCount": 15
    }
  ]
}
```

#### `POST /api/admin/subjects`
Crea una nueva asignatura.

**Body:**
```json
{
  "name": "Historia",
  "teacherId": "teacher_id"
}
```

### **Profesores**

#### `GET /api/teacher/data?teacherId={id}`
Obtiene los datos necesarios para que un profesor ingrese notas.

**Response (200):**
```json
{
  "ok": true,
  "subjects": [
    {
      "id": "subject_id",
      "name": "Matemáticas"
    }
  ],
  "students": [
    {
      "id": "student_id",
      "name": "Ana",
      "lastName": "López",
      "grade": "3°A",
      "rut": "12345678-9"
    }
  ]
}
```

### **Gestión de Notas**

#### `GET /api/grades`
Lista las notas del sistema con filtros opcionales.

**Query Parameters:**
- `studentId` (opcional): Filtrar por alumno
- `subjectId` (opcional): Filtrar por asignatura

**Response (200):**
```json
{
  "ok": true,
  "grades": [
    {
      "id": "grade_id",
      "value": 6.5,
      "type": "CONTROL",
      "date": "2024-01-15T10:30:00Z",
      "studentName": "Ana López",
      "studentGrade": "3°A",
      "subjectName": "Matemáticas"
    }
  ],
  "averages": {
    "subjectAverage": 6.2,
    "totalGrades": 5
  }
}
```

#### `POST /api/grades`
Crea una nueva nota.

**Body:**
```json
{
  "value": 6.5,
  "type": "CONTROL",
  "studentId": "student_id",
  "subjectId": "subject_id"
}
```

**Response (200):**
```json
{
  "ok": true,
  "grade": {
    "id": "grade_id",
    "value": 6.5,
    "type": "CONTROL",
    "date": "2024-01-15T10:30:00Z",
    "studentName": "Ana López",
    "subjectName": "Matemáticas"
  }
}
```

#### `GET /api/grades/averages?studentId={id}`
Calcula los promedios de un alumno específico.

**Response (200):**
```json
{
  "ok": true,
  "student": {
    "name": "Ana",
    "lastName": "López",
    "grade": "3°A"
  },
  "subjectAverages": [
    {
      "subjectName": "Matemáticas",
      "average": 6.2,
      "totalGrades": 5
    },
    {
      "subjectName": "Historia",
      "average": 5.8,
      "totalGrades": 3
    }
  ],
  "generalAverage": 6.0,
  "totalGrades": 8
}
```

### **Usuarios**

#### `GET /api/users`
Lista todos los usuarios del sistema.

**Response (200):**
```json
{
  "ok": true,
  "users": [
    {
      "id": "user_id",
      "name": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "role": "TEACHER"
    }
  ]
}
```

#### `POST /api/users`
Crea un nuevo usuario.

**Body:**
```json
{
  "name": "Pedro Sánchez",
  "email": "pedro@ejemplo.com",
  "password": "contraseña123",
  "role": "PARENT"
}
```

## 🔒 Códigos de Error

### **400 - Bad Request**
```json
{
  "error": "Faltan campos obligatorios"
}
```

### **401 - Unauthorized**
```json
{
  "error": "No autorizado"
}
```

### **404 - Not Found**
```json
{
  "error": "Alumno no encontrado"
}
```

### **500 - Internal Server Error**
```json
{
  "error": "Error interno del servidor"
}
```

## 📊 Tipos de Datos

### **Tipos de Evaluación**
```typescript
type GradeType = "CONTROL" | "PRUEBA" | "EXAMEN" | "TRABAJO" | "OTRO";
```

### **Roles de Usuario**
```typescript
type UserRole = "ADMIN" | "TEACHER" | "PARENT";
```

### **Rango de Notas**
- **Mínimo**: 1.0
- **Máximo**: 7.0
- **Aprobación**: ≥ 4.0

## 🔐 Autenticación

Todas las rutas protegidas requieren autenticación a través de NextAuth.js. El token JWT se maneja automáticamente en las cookies.

### **Headers Requeridos**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

## 📝 Ejemplos de Uso

### **Crear un profesor y asignarle una asignatura**
```javascript
// 1. Crear profesor
const teacherResponse = await fetch('/api/admin/teachers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Juan Pérez',
    email: 'juan@ejemplo.com',
    password: 'contraseña123'
  })
});

// 2. Crear asignatura
const subjectResponse = await fetch('/api/admin/subjects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Matemáticas',
    teacherId: teacherResponse.data.teacher.id
  })
});
```

### **Ingresar notas como profesor**
```javascript
// 1. Obtener datos del profesor
const teacherData = await fetch('/api/teacher/data?teacherId=teacher_id');

// 2. Ingresar nota
const gradeResponse = await fetch('/api/grades', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    value: 6.5,
    type: 'CONTROL',
    studentId: 'student_id',
    subjectId: 'subject_id'
  })
});
```

### **Consultar promedios como apoderado**
```javascript
const averages = await fetch('/api/grades/averages?studentId=student_id');
```

## 🚀 Testing

Para probar los endpoints, puedes usar herramientas como:
- **Postman**
- **Insomnia**
- **Thunder Client** (VS Code extension)
- **curl** (línea de comandos)

### **Ejemplo con curl**
```bash
# Obtener profesores
curl -X GET http://localhost:3001/api/admin/teachers

# Crear nota
curl -X POST http://localhost:3001/api/grades \
  -H "Content-Type: application/json" \
  -d '{"value": 6.5, "type": "CONTROL", "studentId": "student_id", "subjectId": "subject_id"}'
```

---

**Documentación actualizada para la versión 1.0.0** 