// Supabase Auth s'appuie sur un email en interne. On dérive un email
// "fantôme" à partir du nom d'utilisateur pour offrir une connexion par
// username/mot de passe sans jamais exposer d'email à l'utilisateur.
export function usernameToEmail(username: string) {
  const sanitized = username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");

  return `${sanitized}@users.sport-facile.internal`;
}
