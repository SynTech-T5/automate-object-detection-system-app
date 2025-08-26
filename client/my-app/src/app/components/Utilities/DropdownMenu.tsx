import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DropdownMenuDemo({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(false);

    function handleProfile() { }

    function handleAccount() { }

    function handleSetting() { }

    async function handleLogout() {
        if (loading) return;
        setLoading(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            // router.replace('/login'); router.refresh();
            window.location.href = '/login';
        } catch (_) {
            // handle error if needed
        } finally {
            setLoading(false);
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={handleProfile} disabled>
                        Profile
                        {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAccount} disabled>
                        Account
                        {/* <DropdownMenuShortcut>⌘B</DropdownMenuShortcut> */}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSetting} disabled>
                        Settings
                        {/* <DropdownMenuShortcut>⌘S</DropdownMenuShortcut> */}
                    </DropdownMenuItem>

                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    Log out
                    {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}