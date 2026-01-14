export const adminMiddleware = {
  requireAdmin(request, h) {
    const user = request.auth && request.auth.credentials;
    if (!user || !request.auth.isAuthenticated) {
      // Not logged in - redirect to login page
      return h.redirect("/login").takeover();
    }

    if (user.role === "admin") {
      return h.continue;
    }
    // Authenticated but not an admin - send to dashboard
    return h.redirect("/dashboard").takeover();
  },
};
