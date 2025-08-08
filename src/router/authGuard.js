// On définit la logique du garde de route ici, qui sera exportée
export const authGuard = (to, from, next) => {
  const publicRoutes = ['home', 'login']
  const isAuthenticated = localStorage.getItem('jwt_token')
  const isPublicRoute = publicRoutes.includes(to.name);

  if (!isPublicRoute && !isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
}
