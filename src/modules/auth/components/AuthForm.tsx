import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
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
                await registerUser(values.name, values.email, values.password);
            }
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
                            name="name"
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
                            name="confirmPassword"
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
                        <span className="text-xs text-muted-foreground">or</span>
                        <Separator className="grow" />
                    </div>
                    <GoogleSignInButton
                        isLogin={isLogin}
                        onError={setFormError}
                        onSignedIn={() => navigate(redirectTo, { replace: true })}
                    />
                </>
            )}
        </Card>
    );
}
