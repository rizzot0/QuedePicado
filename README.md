# 📚 Sistema de Gestión Escolar - QuedePicado

Un sistema completo de gestión escolar desarrollado con **Next.js**, **Prisma**, **SQLite** y **NextAuth.js** para la gestión de notas, usuarios y asignaturas.

## 🚀 Características Principales

- **🔐 Autenticación segura** con roles diferenciados (Admin, Profesor, Apoderado)
- **📊 Gestión completa de notas** con cálculo automático de promedios
- **👥 Gestión de usuarios** (profesores, apoderados, alumnos)
- **📚 Gestión de asignaturas** con asignación a profesores
- **📈 Reportes y estadísticas** en tiempo real
- **🎨 Interfaz moderna** con Tailwind CSS y shadcn/ui
- **📱 Diseño responsive** para todos los dispositivos

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Datos**: SQLite
- **Autenticación**: NextAuth.js
- **UI Components**: shadcn/ui
- **Deployment**: Vercel (recomendado)

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Git

## ⚙️ Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd QuedePicado
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="tu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Configurar la base de datos**
```bash
npx prisma generate
npx prisma db push
```

5. **Crear usuario administrador**
```bash
node scripts/create-admin.js
```

6. **Ejecutar el servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 👥 Roles y Permisos

### 🔧 **Administrador**
- Gestión completa de usuarios (profesores y apoderados)
- Gestión de alumnos y asignación a apoderados
- Gestión de asignaturas y asignación a profesores
- Reportes generales del sistema
- Acceso a todas las funcionalidades

### 👨‍🏫 **Profesor**
- Ver sus asignaturas asignadas
- Ingresar notas a los alumnos
- Ver historial de notas ingresadas
- Acceso limitado a sus asignaturas

### 👨‍👩‍👧‍👦 **Apoderado**
- Ver información de sus alumnos asociados
- Consultar notas y promedios de sus hijos
- Ver estadísticas de rendimiento
- Acceso solo a información de sus alumnos

## 🏗️ Estructura del Proyecto

```
QuedePicado/
├── src/
│   ├── app/
│   │   ├── admin/           # Páginas del administrador
│   │   ├── teacher/         # Páginas del profesor
│   │   ├── parent/          # Páginas del apoderado
│   │   ├── api/             # Endpoints de la API
│   │   ├── login/           # Página de login
│   │   └── register/        # Página de registro
│   ├── components/          # Componentes reutilizables
│   ├── lib/                 # Utilidades y configuración
│   ├── middleware/          # Middleware de autenticación
│   ├── scripts/             # Scripts de utilidad
│   ├── services/            # Servicios de negocio
│   └── types/               # Tipos TypeScript
├── prisma/
│   ├── schema.prisma        # Esquema de la base de datos
│   └── dev.db              # Base de datos SQLite
└── public/                 # Archivos estáticos
```

## 📊 Esquema de Base de Datos

### **Tablas Principales:**

- **users**: Usuarios del sistema (admin, profesores, apoderados)
- **teachers**: Profesores con sus datos específicos
- **parents**: Apoderados con sus datos específicos
- **students**: Alumnos con información académica
- **subjects**: Asignaturas del colegio
- **grades**: Notas de los alumnos

### **Relaciones:**
- Un profesor puede tener múltiples asignaturas
- Un apoderado puede tener múltiples alumnos
- Un alumno puede tener múltiples notas
- Una asignatura puede tener múltiples notas

## 🔌 Endpoints de la API

### **Autenticación**
```
POST /api/auth/register     # Registro de usuarios
POST /api/auth/[...nextauth] # Login/Logout (NextAuth)
```

### **Administrador**
```
GET    /api/admin/teachers     # Listar profesores
POST   /api/admin/teachers     # Crear profesor
GET    /api/admin/parents      # Listar apoderados
POST   /api/admin/parents      # Crear apoderado
GET    /api/admin/students     # Listar alumnos
POST   /api/admin/students     # Crear alumno
GET    /api/admin/subjects     # Listar asignaturas
POST   /api/admin/subjects     # Crear asignatura
```

### **Profesores**
```
GET /api/teacher/data?teacherId={id}  # Datos del profesor (alumnos y asignaturas)
```

### **Notas**
```
GET    /api/grades                    # Listar notas (con filtros opcionales)
POST   /api/grades                    # Crear nueva nota
GET    /api/grades/averages?studentId={id}  # Promedios de un alumno
```

### **Usuarios**
```
GET    /api/users                     # Listar usuarios
POST   /api/users                     # Crear usuario
```

## 🎯 Funcionalidades por Rol

### **🔧 Panel de Administración**
- **Dashboard**: Vista general del sistema
- **Gestión de Usuarios**: Crear y gestionar profesores/apoderados
- **Gestión de Alumnos**: Registrar alumnos y asociarlos
- **Gestión de Asignaturas**: Crear asignaturas y asignarlas
- **Reporte de Notas**: Estadísticas generales del sistema

### **👨‍🏫 Panel del Profesor**
- **Dashboard**: Vista general de sus asignaturas
- **Mis Asignaturas**: Ver asignaturas asignadas
- **Ingreso de Notas**: Registrar calificaciones de alumnos
- **Historial**: Ver notas ingresadas recientemente

### **👨‍👩‍👧‍👦 Panel del Apoderado**
- **Dashboard**: Vista general de sus alumnos
- **Gestión de Alumnos**: Ver información de sus hijos
- **Notas**: Consultar calificaciones y promedios
- **Estadísticas**: Ver rendimiento académico

## 📱 Páginas Principales

### **Públicas**
- `/` - Página principal
- `/login` - Inicio de sesión
- `/register` - Registro de usuarios

### **Administrador**
- `/admin/dashboard` - Dashboard principal
- `/admin/users` - Gestión de usuarios
- `/admin/students` - Gestión de alumnos
- `/admin/subjects` - Gestión de asignaturas
- `/admin/grades` - Reporte de notas

### **Profesor**
- `/teacher/dashboard` - Dashboard del profesor
- `/teacher/subjects` - Mis asignaturas
- `/teacher/grades` - Ingreso de notas

### **Apoderado**
- `/parent/dashboard` - Dashboard del apoderado
- `/parent/students` - Mis alumnos
- `/parent/grades` - Notas de mis alumnos

## 🔐 Credenciales de Prueba

Después de ejecutar `node scripts/create-admin.js`, tendrás acceso con:

```
Email: admin@admin.com
Contraseña: admin123
```

## 📊 Tipos de Notas

El sistema soporta diferentes tipos de evaluación:
- **CONTROL**: Controles de clase
- **PRUEBA**: Pruebas parciales
- **EXAMEN**: Exámenes finales
- **TRABAJO**: Trabajos y proyectos
- **OTRO**: Otros tipos de evaluación

## 🎨 Características de la UI

- **Colores por rendimiento**: Verde (≥6.0), Amarillo (4.0-5.9), Rojo (<4.0)
- **Diseño responsive**: Optimizado para móviles y tablets
- **Componentes modernos**: Usando shadcn/ui
- **Navegación intuitiva**: Menús claros y accesibles
- **Feedback visual**: Mensajes de éxito y error

## 🚀 Deployment

### **Vercel (Recomendado)**
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático

### **Otros proveedores**
- **Railway**: Soporte nativo para Next.js
- **Netlify**: Configuración manual requerida
- **VPS**: Configuración manual completa

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run start            # Servidor de producción
npm run lint             # Linting del código

# Base de datos
npx prisma studio        # Interfaz visual de la BD
npx prisma generate      # Generar cliente Prisma
npx prisma db push       # Sincronizar esquema
npx prisma migrate dev   # Crear migración

# Utilidades
node scripts/create-admin.js  # Crear usuario admin
```

## 📈 Próximas Funcionalidades

- [ ] **Gráficos y estadísticas avanzadas**
- [ ] **Exportación de reportes a PDF/Excel**
- [ ] **Sistema de notificaciones por email**
- [ ] **Gestión de calendario académico**
- [ ] **Evaluaciones con rúbricas**
- [ ] **Sistema de cursos y secciones**
- [ ] **Logs de auditoría**
- [ ] **Backup automático**

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación de Next.js y Prisma

---

**Desarrollado con ❤️ para la gestión escolar moderna**
