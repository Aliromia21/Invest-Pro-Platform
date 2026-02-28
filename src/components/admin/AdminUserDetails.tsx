import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useAdminUser } from "@/hooks/useAdminUser";
import { AdminUserDetailsView } from "./AdminUserDetailsView";

export function AdminUserDetails({
  userId,
  open,
  onClose,
}: {
  userId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data: user, isLoading, error } = useAdminUser(userId, open);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 text-white border-white/20 w-[min(1100px,95vw)] max-h-[85vh] p-0 overflow-hidden flex flex-col">
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-white/10 px-6 py-4">
          <DialogHeader className="p-0">
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5">
          {isLoading && <p className="text-blue-200">Loading user...</p>}
          {error && <p className="text-red-400">Failed to load user</p>}
          {user && <AdminUserDetailsView user={user} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
