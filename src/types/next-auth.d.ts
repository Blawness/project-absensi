import { UserRole } from '@prisma/client';
import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    department?: string;
    position?: string;
    avatarUrl?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      department?: string;
      position?: string;
      avatarUrl?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    department?: string;
    position?: string;
    avatarUrl?: string;
  }
}
