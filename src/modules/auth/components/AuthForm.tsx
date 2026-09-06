import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { toast } from '@/shared/lib/alert';
import {
    Button,
    Card,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Separator,
} from "../../../shared/components/ui";
import {
    loginSchema,
    registerSchema,
    type RegisterInput,
} from "../schemas/auth.schema";
import { useAuth } from "../hooks/useAuth";
import { GoogleSignInButton } from "./GoogleSignInButton";

type AuthMode = "login" | "register";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface AuthFormProps {
    mode: AuthMode;
}

export function AuthForm({ mode }: AuthFormProps) {
    const isLogin = mode === "login";
    const { login, register: registerUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo =
        (location.state as { from?: string } | null)?.from ?? "/";
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<RegisterInput>({
        resolver: zodResolver(
            isLogin ? loginSchema : registerSchema,
        ) as unknown as Resolver<RegisterInput>,
        mode: "onTouched",
    });

    const onSubmit = form.handleSubmit(async (values) => {
        setSubmitting(true);
        setFormError(null);
        try {
            if (isLogin) {
                await login(values.email, values.password);
            } else {
                await registerUser(values.full_name, values.email, values.password);
            }
            toast.success("Successfully logged in");
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setFormError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Try again.",
            );
        } finally {
            setSubmitting(false);
        }
    });

    return (
        <Card className="mx-auto w-full max-w-md p-6 sm:p-8">
            <p className="font-mono text-xs font-medium tracking-[0.14em] text-primary uppercase">
                {isLogin ? "Welcome back" : "Join the store"}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">
                {isLogin ? "Sign in" : "Create account"}
            </h1>

            <Form {...form}>
                <form
                    onSubmit={onSubmit}
                    noValidate
                    className="mt-5 flex flex-col gap-4"
                >
                    {!isLogin && (
                        <FormField
                            name="full_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            autoComplete="name"
                                            placeholder="Ada Lovelace"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    <FormField
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        autoComplete={
                                            isLogin
                                                ? "current-password"
                                                : "new-password"
                                        }
                                        placeholder="••••••••"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {!isLogin && (
                        <FormField
                            name="confirm_password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {formError && (
                        <p
                            role="alert"
                            className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                        >
                            {formError}
                        </p>
                    )}

                    <Button
                        type="submit"
                        size="lg"
                        disabled={submitting}
                        className="mt-1"
                    >
                        {submitting ? (
                            <>
                                <LoaderCircle className="animate-spin" /> One
                                moment…
                            </>
                        ) : (
                            <>
                                {isLogin ? "Sign in" : "Create account"}{" "}
                                {/* <ArrowRight /> */}
                            </>
                        )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        {isLogin ? (
                            <>
                                No account yet?{" "}
                                <Link
                                    to="/register"
                                    className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                                >
                                    Register
                                </Link>
                            </>
                        ) : (
                            <>
                                Already registered?{" "}
                                <Link
                                    to="/login"
                                    className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                                >
                                    Sign in
                                </Link>
                            </>
                        )}
                    </p>
                </form>
            </Form>

            {GOOGLE_CLIENT_ID && (
                <>
                    <div className="my-5 flex items-center gap-3" aria-hidden="true">
                        <Separator className="grow" />
                        <span className="text-xs text-muted-foreground">OR</span>
                        <Separator className="grow" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <GoogleSignInButton
                            isLogin={isLogin}
                            onError={setFormError}
                            onSignedIn={() => navigate(redirectTo, { replace: true })}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="w-full gap-2"
                            onClick={() => setFormError('Apple Sign-In is not yet configured.')}
                        >
                            <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
                                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                            Continue with Apple
                        </Button>
                    </div>
                </>
            )}
            {!GOOGLE_CLIENT_ID && (
                <>
                    <div className="my-5 flex items-center gap-3" aria-hidden="true">
                        <Separator className="grow" />
                        <span className="text-xs text-muted-foreground">OR</span>
                        <Separator className="grow" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="w-full gap-2"
                            onClick={() => setFormError('Google Sign-In is not yet configured.')}
                        >
                            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="w-full gap-2"
                            onClick={() => setFormError('Apple Sign-In is not yet configured.')}
                        >
                            <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
                                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                            Continue with Apple
                        </Button>
                    </div>
                </>
            )}
        </Card>
    );
}
