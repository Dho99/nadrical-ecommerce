import { Outlet } from "react-router-dom";
import { AdminGuard } from "../routes/AdminGuard";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

export function AdminLayout() {
    return (
        <AdminGuard>
            <div className="flex min-h-svh bg-muted/30">
                <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r bg-background lg:block">
                    <AdminSidebar />
                </aside>
                <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
                    <AdminTopbar />
                    <main className="grow">
                        <div className="container mx-auto px-5 py-8 sm:px-8">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </AdminGuard>
    );
}
