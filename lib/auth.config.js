
export const authConfig = {
    secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const { pathname } = nextUrl;

            const publicRoutes = ["/", "/login", "/register", "/events", "/verify", "/profile"];
            const isPublicRoute = publicRoutes.includes(pathname);

            if (isPublicRoute) return true;

            // For /profile, check if user is logged in
            if (pathname === "/profile") {
                if (!isLoggedIn) return false;
                return true;
            }

            if (!isLoggedIn) return false;

            const dashboardRoutes = {
                "/admin": "admin",
                "/organizer": "organizer",
                "/judge": "judge",
                "/mentor": "mentor",
                "/participant": "participant",
            };

            const userRole = auth.user.role || "participant";

            for (const [route, requiredRole] of Object.entries(dashboardRoutes)) {
                if (pathname.startsWith(route)) {
                    if (userRole !== requiredRole) {
                        const targetPath = `/${userRole}`;
                        if (pathname === targetPath) return true;

                        const redirectUrl = new URL(targetPath, nextUrl);
                        return Response.redirect(redirectUrl);
                    }
                    return true;
                }
            }

            return true;
        },
    },
    providers: [],
};
