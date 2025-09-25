import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: UserRole.admin,
      department: 'IT',
      position: 'System Admin',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 12);
  
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@company.com' },
    update: {},
    create: {
      email: 'manager@company.com',
      password: managerPassword,
      name: 'Team Manager',
      role: UserRole.manager,
      department: 'Operations',
      position: 'Manager',
      isActive: true,
    },
  });

  console.log('✅ Manager user created:', managerUser.email);

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 12);
  
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@company.com' },
    update: {},
    create: {
      email: 'user@company.com',
      password: userPassword,
      name: 'Regular Employee',
      role: UserRole.user,
      department: 'Operations',
      position: 'Employee',
      isActive: true,
    },
  });

  console.log('✅ Regular user created:', regularUser.email);

  // Create default settings
  const officeLocationSetting = await prisma.setting.upsert({
    where: { key: 'office_location' },
    update: {},
    create: {
      key: 'office_location',
      value: {
        latitude: -6.2088,
        longitude: 106.8456,
        address: 'Jakarta, Indonesia',
        radius: 100
      },
      description: 'Office location for geofencing',
      isPublic: true,
    },
  });

  const workScheduleSetting = await prisma.setting.upsert({
    where: { key: 'work_schedule' },
    update: {},
    create: {
      key: 'work_schedule',
      value: {
        check_in_start: '06:00',
        check_in_end: '10:00',
        check_out_start: '14:00',
        check_out_end: '22:00',
        work_hours_min: 4,
        work_hours_max: 12,
        late_tolerance: 15
      },
      description: 'Work schedule configuration',
      isPublic: true,
    },
  });

  const geofencingSetting = await prisma.setting.upsert({
    where: { key: 'geofencing' },
    update: {},
    create: {
      key: 'geofencing',
      value: {
        enabled: true,
        radius_meters: 100,
        accuracy_threshold: 10
      },
      description: 'Geofencing settings',
      isPublic: false,
    },
  });

  console.log('✅ Default settings created');

  // Create sample attendance record for demo
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sampleAttendance = await prisma.absensiRecord.upsert({
    where: {
      userId_date: {
        userId: regularUser.id,
        date: today,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      date: today,
      checkInTime: new Date(today.getTime() + 8 * 60 * 60 * 1000), // 8 AM
      checkInLatitude: -6.2088,
      checkInLongitude: 106.8456,
      checkInAddress: 'Jakarta, Indonesia',
      checkInAccuracy: 5.0,
      status: 'present',
      notes: 'Sample attendance record',
    },
  });

  console.log('✅ Sample attendance record created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Test accounts created:');
  console.log('  Admin: admin@company.com / admin123');
  console.log('  Manager: manager@company.com / manager123');
  console.log('  User: user@company.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
