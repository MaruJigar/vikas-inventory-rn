export const manufacturersKeys = {
  all: ['manufacturers'] as const,
  profile: () => [...manufacturersKeys.all, 'profile'] as const,
};
