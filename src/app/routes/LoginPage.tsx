import { AuthForm } from "../../modules/auth";

export function LoginPage() {
    return (
        <div className="container mx-auto px-5 py-12 sm:px-8">
            <header className="mb-8 text-center">
                <p className="font-mono text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                    Store account
                </p>
                <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
                    Sign in
                </h1>
            </header>
            <AuthForm mode="login" />
        </div>
    );
}
