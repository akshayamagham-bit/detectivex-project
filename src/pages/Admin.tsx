import {
    UsersIcon,
    FolderIcon,
    DocumentTextIcon,
    ShieldCheckIcon,
    ServerIcon,
    Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { Card, SectionTitle } from "@/components/ui/Card";
import { useApp } from "@/context/AppContext";

export function Admin() {
    const { evidence, audit } = useApp();

    const stats = [
        {
            label: "Total Users",
            value: "3",
            icon: UsersIcon,
        },
        {
            label: "Active Cases",
            value: "12",
            icon: FolderIcon,
        },
        {
            label: "Evidence Records",
            value: evidence.length.toString(),
            icon: DocumentTextIcon,
        },
        {
            label: "Audit Events",
            value: audit.length.toString(),
            icon: ShieldCheckIcon,
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <SectionTitle
                    title="Admin Panel"
                    subtitle="DetectiveX system administration and management"
                />
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <Card key={stat.label} className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-fx-muted">{stat.label}</p>
                                    <p className="mt-2 text-3xl font-semibold fx-text">
                                        {stat.value}
                                    </p>
                                </div>

                                <div className="grid h-12 w-12 place-items-center rounded-xl bg-fx-accent/10">
                                    <Icon className="h-6 w-6 text-fx-accent" />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Administration */}
            <Card className="p-6">
                <SectionTitle
                    title="System Administration"
                    subtitle="Manage DetectiveX enterprise services"
                />

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <AdminCard
                        icon={UsersIcon}
                        title="User Management"
                        description="Manage investigators, supervisors and administrators."
                    />

                    <AdminCard
                        icon={FolderIcon}
                        title="Case Management"
                        description="View and manage investigation cases."
                    />

                    <AdminCard
                        icon={DocumentTextIcon}
                        title="Evidence Management"
                        description="Monitor evidence records and chain of custody."
                    />

                    <AdminCard
                        icon={ShieldCheckIcon}
                        title="Security"
                        description="Review authentication, permissions and security controls."
                    />

                    <AdminCard
                        icon={ServerIcon}
                        title="Backup & Restore"
                        description="Create and manage system backups."
                    />

                    <AdminCard
                        icon={Cog6ToothIcon}
                        title="System Settings"
                        description="Configure DetectiveX system preferences."
                    />
                </div>
            </Card>

            {/* System status */}
            <Card className="p-6">
                <SectionTitle
                    title="System Status"
                    subtitle="Current DetectiveX service status"
                />

                <div className="mt-5 space-y-3">
                    <StatusRow name="Frontend Application" status="Operational" />
                    <StatusRow name="Backend API" status="Operational" />
                    <StatusRow name="MongoDB Database" status="Operational" />
                    <StatusRow name="Authentication Service" status="Operational" />
                </div>
            </Card>
        </div>
    );
}

function AdminCard({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border border-fx-border bg-fx-card p-5 transition hover:border-fx-accent/50">
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-fx-accent/10">
                <Icon className="h-5 w-5 text-fx-accent" />
            </div>

            <h3 className="font-semibold fx-text">{title}</h3>

            <p className="mt-2 text-sm text-fx-muted">
                {description}
            </p>
        </div>
    );
}

function StatusRow({
    name,
    status,
}: {
    name: string;
    status: string;
}) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-fx-border p-4">
            <span className="text-sm fx-text">{name}</span>

            <span className="flex items-center gap-2 text-sm text-fx-success">
                <span className="h-2 w-2 rounded-full bg-fx-success" />
                {status}
            </span>
        </div>
    );
}