import { useState } from "react";
import { PencilIcon, PlusIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

type UserRole = "Admin" | "Investigator" | "Supervisor";

type User = {
    id: number;
    name: string;
    badge: string;
    role: UserRole;
    status: "Active" | "Disabled";
    lastActivity: string;
};

const initialUsers: User[] = [
    {
        id: 1,
        name: "Det. Akshaya",
        badge: "BX-7741",
        role: "Admin",
        status: "Active",
        lastActivity: "Today, 10:32 AM",
    },
    {
        id: 2,
        name: "Sgt. James Calder",
        badge: "SG-2048",
        role: "Supervisor",
        status: "Active",
        lastActivity: "Today, 09:14 AM",
    },
    {
        id: 3,
        name: "Lt. Priya Nair",
        badge: "LT-3812",
        role: "Investigator",
        status: "Active",
        lastActivity: "Yesterday, 06:42 PM",
    },
];

export function UserManagement() {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [showForm, setShowForm] = useState(false);

    const [name, setName] = useState("");
    const [badge, setBadge] = useState("");
    const [role, setRole] = useState<UserRole>("Investigator");

    const addUser = () => {
        if (!name.trim() || !badge.trim()) return;

        const newUser: User = {
            id: Date.now(),
            name,
            badge,
            role,
            status: "Active",
            lastActivity: "Never",
        };

        setUsers((prev) => [...prev, newUser]);

        setName("");
        setBadge("");
        setRole("Investigator");
        setShowForm(false);
    };

    const toggleStatus = (id: number) => {
        setUsers((prev) =>
            prev.map((user) =>
                user.id === id
                    ? {
                        ...user,
                        status: user.status === "Active" ? "Disabled" : "Active",
                    }
                    : user
            )
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">
                        User Management
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Manage authorized DetectiveX personnel and clearance roles.
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-semibold text-black hover:bg-amber-400"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add User
                </button>
            </div>

            {showForm && (
                <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                    <h2 className="mb-4 text-lg font-semibold text-white">
                        Add New User
                    </h2>

                    <div className="grid gap-4 md:grid-cols-3">
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Officer name"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                        />

                        <input
                            value={badge}
                            onChange={(e) => setBadge(e.target.value)}
                            placeholder="Badge number"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                        />

                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                        >
                            <option value="Investigator">Investigator</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <button
                        onClick={addUser}
                        className="mt-4 rounded-lg bg-amber-500 px-5 py-2 font-semibold text-black"
                    >
                        Create User
                    </button>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                <div className="flex items-center gap-3 border-b border-slate-800 p-4">
                    <ShieldCheckIcon className="h-5 w-5 text-amber-400" />
                    <span className="font-medium text-white">
                        Authorized Personnel
                    </span>
                    <span className="text-sm text-slate-500">
                        {users.length} users
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-5 py-4">Officer</th>
                                <th className="px-5 py-4">Badge</th>
                                <th className="px-5 py-4">Role</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4">Last Activity</th>
                                <th className="px-5 py-4">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-b border-slate-900 hover:bg-slate-900/60"
                                >
                                    <td className="px-5 py-4">
                                        <div className="font-medium text-white">
                                            {user.name}
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 font-mono text-sm text-slate-400">
                                        {user.badge}
                                    </td>

                                    <td className="px-5 py-4">
                                        <span className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300">
                                            {user.role}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={
                                                user.status === "Active"
                                                    ? "text-green-400"
                                                    : "text-red-400"
                                            }
                                        >
                                            ● {user.status}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-400">
                                        {user.lastActivity}
                                    </td>

                                    <td className="px-5 py-4">
                                        <button
                                            onClick={() => toggleStatus(user.id)}
                                            className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                            {user.status === "Active" ? "Disable" : "Enable"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}