// On définit la logique du garde de route ici, qui sera exportée
export const authGuard = (to, from, next) => {
  const publicRoutes = ['login', 'login_link', 'credentials']
  const isAuthenticated = localStorage.getItem('jwt_token')
  const isPublicRoute = publicRoutes.includes(to.name);

  if (!isPublicRoute && !isAuthenticated) {
    next({ name: 'login_link' })
  } else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'profile' })
  } else {
    next()
  }
}
