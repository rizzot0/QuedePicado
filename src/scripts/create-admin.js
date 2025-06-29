const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('Ya existe un administrador en el sistema');
      return;
    }

    // Crear el administrador
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@escuela.cl',
        password: hashedPassword,
        name: 'Administrador',
        role: 'ADMIN'
      }
    });

    console.log('✅ Administrador creado exitosamente:');
    console.log('Email: admin@escuela.cl');
    console.log('Contraseña: admin123');
    console.log('ID:', admin.id);

  } catch (error) {
    console.error('Error al crear administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 